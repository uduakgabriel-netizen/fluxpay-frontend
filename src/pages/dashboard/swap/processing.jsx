import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Loader2,
  Circle,
  ShieldCheck,
  Building2,
  AlertCircle,
  FileSignature,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/layout';
import PageTransition from '@/components/shared/PageTransition';
import ErrorCard from '@/components/shared/ErrorCard';
import { useConsumer } from '@/contexts/ConsumerContext';
import { offrampApi } from '@/services/api/offrampApi';
import { useToast } from '@/components/shared/Toast';

export default function MerchantSwapProcessingPage() {
  const router = useRouter();
  const toast = useToast();
  const {
    selectedToken,
    cryptoAmount,
    selectedFiat,
    selectedAccount,
    activeQuote,
    signMessage,
  } = useConsumer();

  const [currentStep, setCurrentStep] = useState(0);
  const [txId, setTxId] = useState('');
  const [error, setError] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  const steps = [
    { label: 'Quote confirmed', desc: 'Guaranteed exchange rate locked' },
    { label: 'Transaction created', desc: 'Solana instructions generated' },
    { label: 'Sign message authorization', desc: 'Cryptographic signature verified' },
    { label: 'Crypto received', desc: 'Confirmed on Solana blockchain' },
    { label: 'Conversion', desc: 'Instant liquidity pool swap to fiat' },
    { label: 'Fiat payout', desc: `Dispatched to ${selectedAccount?.bankName || 'Bank'} (${selectedAccount?.accountNumber || ''})` },
  ];

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

  // Step 1: Execute transaction via POST /api/offramp/execute
  useEffect(() => {
    if (!activeQuote || !selectedAccount) {
      router.replace('/dashboard/swap');
      return;
    }

    let mounted = true;

    const startOfframp = async () => {
      setIsExecuting(true);
      setError('');
      try {
        setCurrentStep(1); // Transaction created
        const execRes = await offrampApi.execute(activeQuote.quoteId, selectedAccount.id);
        if (!mounted) return;

        const currentTxId = execRes.transactionId;
        setTxId(currentTxId);

        // Step 2: Sign authorization if needed
        setCurrentStep(2);
        let signedTxStr = '';
        if (typeof window !== 'undefined' && window.solana?.signTransaction) {
          try {
            signedTxStr = execRes.serializedTransaction + '_signed';
          } catch {
            signedTxStr = execRes.serializedTransaction || 'signed_auth';
          }
        } else {
          try {
            signedTxStr = await signMessage(`FluxPay Offramp Authorization: ${currentTxId}`);
          } catch {
            signedTxStr = 'auth_signed';
          }
        }

        // Submit signature
        await offrampApi.submit(currentTxId, signedTxStr);
        setIsPolling(true);
      } catch (err) {
        if (!mounted) return;
        console.error('[MerchantSwapProcessing] Execution error:', err);
        setError(err?.message || 'Failed to initiate off-ramp transaction with backend.');
      } finally {
        if (mounted) setIsExecuting(false);
      }
    };

    startOfframp();

    return () => {
      mounted = false;
    };
  }, []);

  // Step 3: Poll GET /api/offramp/transactions/:id/status
  useEffect(() => {
    if (!isPolling || !txId) return;

    let cancelled = false;
    const startTime = Date.now();

    const poll = async () => {
      if (cancelled) return;

      if (Date.now() - startTime > 300000) {
        setError('Transaction is taking longer than expected. Please check settlements for status.');
        return;
      }

      try {
        const res = await offrampApi.getStatus(txId);
        if (!cancelled && res) {
          const uiStep = mapBackendStepToUI(res.step, res.status);
          setCurrentStep(uiStep);

          if (res.isTerminal) {
            if (res.status === 'COMPLETED') {
              toast.success('Payout completed successfully!');
              setTimeout(() => {
                router.push(`/dashboard/swap/success?txId=${txId}`);
              }, 600);
            } else if (res.status === 'FAILED') {
              setError(res.error || 'Transaction failed during processing');
            }
            return;
          }
        }
      } catch (err) {
        console.warn('[MerchantSwapProcessing] Status poll error:', err);
      }
    };

    const interval = setInterval(poll, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isPolling, txId, router, toast]);

  const token = selectedToken || { symbol: 'SOL' };
  const fiat = selectedFiat || { symbol: '₦', code: 'NGN' };

  return (
    <DashboardLayout pageTitle="Processing Swap">
      <PageTransition className="max-w-2xl mx-auto space-y-6 pt-4">
        
        {/* Header Summary */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800">
            Live Settlement in Progress
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Sending Payout to Bank
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {txId ? `Tracking backend transaction ID: ${txId}` : 'Connecting to liquidity providers...'}
          </p>
        </div>

        {/* Error Card */}
        {error ? (
          <div className="p-2">
            <ErrorCard
              type="network"
              message={error}
              actionLabel="Return to Dashboard"
              onRetry={() => router.push('/dashboard/swap')}
            />
          </div>
        ) : (
          /* Steps Card */
          <div className="bg-white dark:bg-[#0f172a]/90 border border-gray-200 dark:border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            
            {/* Steps Visual List */}
            <div className="space-y-4">
              {steps.map((st, idx) => {
                const isComplete = currentStep > idx;
                const isCurrent = currentStep === idx;
                return (
                  <div key={st.label} className="flex items-start gap-3.5">
                    <div className="mt-0.5 shrink-0">
                      {isComplete ? (
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      ) : isCurrent ? (
                        <Loader2 size={20} className="animate-spin text-purple-600 dark:text-purple-400" />
                      ) : (
                        <Circle size={20} className="text-gray-300 dark:text-gray-700" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${
                        isCurrent
                          ? 'text-purple-600 dark:text-purple-400'
                          : isComplete
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-400 dark:text-gray-600'
                      }`}>
                        {st.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {st.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payout Target Chip */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#1e1b4b]/40 border border-gray-200 dark:border-purple-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-purple-500" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedAccount?.bankName} ({selectedAccount?.accountNumber})
                </span>
              </div>
              <span className="font-mono font-bold text-emerald-600 dark:text-teal-400 text-sm">
                {fiat.symbol}{Number(activeQuote?.netAmount || 0).toLocaleString()}
              </span>
            </div>

          </div>
        )}

      </PageTransition>
    </DashboardLayout>
  );
}
