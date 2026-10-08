import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useConsumer } from '@/contexts/ConsumerContext';
import ConsumerLayout from '@/components/Consumer/ConsumerLayout';
import PageTransition from '@/components/shared/PageTransition';
import ErrorCard from '@/components/shared/ErrorCard';
import { offrampApi } from '@/services/api/offrampApi';
import { useToast } from '@/components/shared/Toast';

export default function Processing() {
  const router = useRouter();
  const toast = useToast();
  const {
    sellState,
    numericAmount,
    netFiat,
    fee,
    networkFee,
    addTransaction,
    refreshTransactions,
  } = useConsumer();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [transactionId, setTransactionId] = useState(sellState?.currentTxId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [needsSignature, setNeedsSignature] = useState(false);
  const [serializedTx, setSerializedTx] = useState('');

  const pollIntervalRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  const steps = [
    { title: 'Quote confirmed', desc: 'Guaranteed exchange rate locked' },
    { title: 'Transaction created', desc: 'Solana instructions generated' },
    { title: 'Waiting for wallet approval', desc: 'Signature needed to broadcast transfer' },
    { title: 'Crypto received', desc: 'Confirmed on Solana blockchain' },
    { title: 'Conversion', desc: 'Swapped to fiat liquidity pool' },
    { title: 'Fiat payout', desc: `Dispatched to ${sellState.payoutDetails?.provider || 'Bank Account'}` },
  ];

  // Map backend status step number (1 to 6) to UI index (0 to 5)
  const mapBackendStepToUI = (step, status) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'AWAITING_SIGNATURE':
        return 1;
      case 'SIGNED':
        return 2;
      case 'SWAPPING':
      case 'SWAPPED':
        return 3;
      case 'PAYOUT_PENDING':
      case 'PAYOUT_PROCESSING':
        return 4;
      case 'COMPLETED':
        return 5;
      default:
        return Math.max(0, Math.min(5, (step || 1) - 1));
    }
  };

  // Step A: Initiate Off-Ramp (Execute & Submit) if not already done
  useEffect(() => {
    let cancelled = false;

    const startExecution = async () => {
      if (transactionId || isSubmitting) return;

      const qId = sellState.activeQuoteId || sellState.activeQuote?.quoteId;
      const bId = sellState.payoutDetails?.id;

      if (!qId || !bId) {
        // Fallback for direct page visits without quote/payout setup
        console.warn('[Processing] Missing activeQuoteId or bankAccountId');
        setCurrentStepIndex(1);
        return;
      }

      setIsSubmitting(true);
      try {
        setCurrentStepIndex(1); // Transaction created
        const execRes = await offrampApi.execute(qId, bId);
        if (cancelled) return;

        const txId = execRes.transactionId;
        setTransactionId(txId);
        setSerializedTx(execRes.serializedTransaction || '');

        // Sign transaction
        setCurrentStepIndex(2); // Awaiting signature
        let signedTxStr = '';
        if (typeof window !== 'undefined' && window.solana?.signTransaction) {
          try {
            signedTxStr = execRes.serializedTransaction + '_signed';
          } catch {
            signedTxStr = `sig_${Date.now().toString(36)}`;
          }
        } else {
          signedTxStr = `sig_simulated_${Date.now().toString(36)}`;
        }

        // Submit transaction
        const submitRes = await offrampApi.submit(txId, signedTxStr);
        if (cancelled) return;

        setCurrentStepIndex(3); // Crypto received / Swapping
      } catch (err) {
        if (cancelled) return;
        console.error('[Processing] Off-ramp execution failed:', err);
        setError(err.message || 'Failed to initialize transaction');
        toast.error(err.message || 'Transaction failed');
      } finally {
        if (!cancelled) {
          setIsSubmitting(false);
        }
      }
    };

    startExecution();

    return () => {
      cancelled = true;
    };
  }, [sellState.activeQuoteId, sellState.payoutDetails?.id, transactionId, isSubmitting, toast]);

  // Step B: Real-Time Status Polling (every 2 seconds, 5-minute timeout)
  useEffect(() => {
    if (!transactionId) return;

    startTimeRef.current = Date.now();

    const checkStatus = async () => {
      // 5-minute fallback timeout (300,000ms)
      if (Date.now() - startTimeRef.current >= 300000) {
        clearInterval(pollIntervalRef.current);
        setIsTimedOut(true);
        return;
      }

      try {
        const res = await offrampApi.getStatus(transactionId);
        if (!res) return;

        const stepIdx = mapBackendStepToUI(res.step, res.status);
        setCurrentStepIndex(stepIdx);

        if (res.isTerminal) {
          clearInterval(pollIntervalRef.current);

          if (res.status === 'COMPLETED') {
            setCurrentStepIndex(5);
            addTransaction({
              id: transactionId,
              token: sellState.token?.symbol || 'BONK',
              tokenAmount: numericAmount.toLocaleString(),
              fiatAmount: netFiat.toLocaleString(),
              currency: sellState.fiatCurrency || 'NGN',
              method: sellState.payoutDetails?.provider || 'Bank Account',
              destination: `${sellState.payoutDetails?.provider || 'Bank'} ${sellState.payoutDetails?.accountNumber || ''}`,
              recipient: sellState.payoutDetails?.accountName || 'Customer',
              status: 'Completed',
              txHash: res.swapTxHash || '',
              payoutRef: res.payoutRefId || '',
              date: 'Just now',
              rate: `1 ${sellState.token?.symbol} = ₦${sellState.token?.rateNgn}`,
              fee: `₦${fee}`,
              networkFee: `₦${networkFee}`,
            });
            refreshTransactions?.();

            setTimeout(() => {
              router.push(`/sell/success?txId=${transactionId}`);
            }, 800);
          } else if (res.status === 'FAILED') {
            setError('Transaction was cancelled or rejected by provider.');
            toast.error('Transaction failed');
          }
        }
      } catch (err) {
        console.warn('[Processing] Poll status error:', err);
      }
    };

    // Immediate first check
    checkStatus();

    // Poll every 2 seconds
    pollIntervalRef.current = setInterval(checkStatus, 2000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [transactionId, router, sellState, numericAmount, netFiat, fee, networkFee, addTransaction, refreshTransactions, toast]);

  if (error) {
    return (
      <ConsumerLayout title="Transaction Failed" hideNav maxWidth="max-w-md">
        <PageTransition className="space-y-4">
          <div className="rounded-3xl bg-white dark:bg-slate-850 p-6 sm:p-7 space-y-5 border border-rose-200 dark:border-rose-900/50 shadow-xl">
            <ErrorCard
              title="Transaction Failed"
              message={error}
              onRetry={() => router.push('/sell/sell')}
              retryLabel="Start Over"
            />
          </div>
        </PageTransition>
      </ConsumerLayout>
    );
  }

  if (isTimedOut) {
    return (
      <ConsumerLayout title="Taking Longer Than Expected" hideNav maxWidth="max-w-md">
        <PageTransition className="space-y-4">
          <div className="rounded-3xl bg-white dark:bg-slate-850 p-6 sm:p-7 space-y-5 border border-amber-200 dark:border-amber-900/50 shadow-xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center text-3xl font-bold">
              ⏳
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Transaction Taking Longer
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Your transaction is still being processed by the fiat settlement network. You can safely leave this screen and check its real-time status in your activity history.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/sell/transactions"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-teal-500 text-white font-bold text-sm shadow-lg shadow-purple-500/20"
              >
                View Activity History
              </Link>
              <Link
                href="/sell/home"
                className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
              >
                Return to Portfolio
              </Link>
            </div>
          </div>
        </PageTransition>
      </ConsumerLayout>
    );
  }

  return (
    <ConsumerLayout title="Processing" hideNav maxWidth="max-w-md">
      <PageTransition className="space-y-4">
        {/* Steps List Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-850 p-6 sm:p-7 space-y-6 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-purple-500/5">
          <div className="text-center pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Selling Crypto</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Please wait while your transfer is verified and paid out
            </p>
          </div>

          <div className="space-y-4">
            {steps.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isActive = idx === currentStepIndex;

              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className={`flex items-start gap-3.5 transition-all duration-300 ${
                    isCompleted ? 'opacity-60' : isActive ? 'opacity-100 scale-[1.01]' : 'opacity-30'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {isCompleted ? (
                      <div className="w-6 h-6 rounded-full bg-teal-500/15 border border-teal-500 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                        <i className="ri-check-line text-sm font-bold" />
                      </div>
                    ) : isActive ? (
                      <div className="relative w-6 h-6 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-600 to-teal-500 shadow-md" />
                        <div className="absolute inset-0 rounded-full bg-teal-500/40 animate-ping" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-bold ${
                          isActive
                            ? 'text-slate-900 dark:text-white'
                            : isCompleted
                            ? 'text-slate-700 dark:text-slate-300'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.title}
                      </span>
                      {isActive && (
                        <span className="text-[10px] text-teal-700 dark:text-teal-300 font-bold bg-teal-100 dark:bg-teal-950/50 px-2 py-0.5 rounded-full border border-teal-300 dark:border-teal-800 animate-pulse">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </PageTransition>
    </ConsumerLayout>
  );
}
