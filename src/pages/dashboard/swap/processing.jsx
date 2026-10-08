import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Loader2,
  Circle,
  ShieldCheck,
  FileSignature,
  Building2,
  ArrowRight,
  Lock,
  Check,
  ExternalLink
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/layout';
import PageTransition from '@/components/shared/PageTransition';
import { useConsumer, TOKENS, FIATS } from '@/contexts/ConsumerContext';
import { useAuth } from '@/contexts/AuthContext';

export default function MerchantSwapProcessingPage() {
  const router = useRouter();
  const { merchant } = useAuth();
  const {
    selectedToken,
    cryptoAmount,
    selectedFiat,
    selectedAccount,
    bankAccounts,
    signMessage,
  } = useConsumer();

  const token = selectedToken || TOKENS[0] || {
    symbol: 'SOL',
    rateNgn: 300153,
  };
  const fiat = selectedFiat || (FIATS && FIATS[0]) || { symbol: '₦', code: 'NGN' };
  const accounts = (bankAccounts && bankAccounts.length > 0) ? bankAccounts : [];
  const account = selectedAccount || accounts[0] || {
    bankName: 'OPay',
    accountNumber: '080XXXXXXXX',
    accountName: 'UDUAK GABRIEL AKPAN',
  };

  const numCrypto = Number(cryptoAmount || 1.5);
  const grossFiat = Math.round(numCrypto * (token.rateNgn || 300153));
  const fluxFee = Math.round(grossFiat * 0.01);
  const netFiat = Math.max(0, grossFiat - fluxFee - 12);

  const [currentStep, setCurrentStep] = useState(0);
  const [hasSigned, setHasSigned] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [txId, setTxId] = useState('');
  const [error, setError] = useState('');

  const steps = [
    { label: 'Quote confirmed', desc: 'Guaranteed exchange rate locked' },
    { label: 'Transaction created', desc: 'Solana instructions generated' },
    { label: 'Sign message authorization', desc: 'Cryptographic signature required' },
    { label: 'Crypto received', desc: 'Confirmed on Solana blockchain' },
    { label: 'Conversion', desc: 'Instant liquidity pool swap to NGN' },
    { label: 'Fiat payout', desc: `Dispatched to ${account.bankName} (${account.accountNumber})` },
  ];

  // Initialize transaction
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const { offrampApi } = await import('@/services/api/offrampApi');
        const qId = sellState?.activeQuoteId || activeQuote?.quoteId;
        const bId = account?.id;
        if (qId && bId) {
          const res = await offrampApi.execute(qId, bId);
          if (mounted && res?.transactionId) {
            setTxId(res.transactionId);
            setCurrentStep(2);
            setShowSignModal(true);
            return;
          }
        }
      } catch (err) {
        console.warn('Offramp execute fallback:', err);
      }
      if (mounted) {
        setTimeout(() => setCurrentStep(1), 500);
        setTimeout(() => {
          setCurrentStep(2);
          setShowSignModal(true);
        }, 1200);
      }
    };
    init();
    return () => { mounted = false; };
  }, []);

  // Poll status every 2 seconds once signed
  useEffect(() => {
    if (!hasSigned) return;

    let cancelled = false;
    const startTime = Date.now();

    const poll = async () => {
      if (cancelled) return;
      if (Date.now() - startTime > 300000) {
        setError('Transaction is taking longer than expected. Please check your settlements.');
        return;
      }

      if (txId) {
        try {
          const { offrampApi } = await import('@/services/api/offrampApi');
          const res = await offrampApi.getStatus(txId);
          if (!cancelled && res) {
            if (res.step >= 4) setCurrentStep(3);
            if (res.step >= 5) setCurrentStep(4);
            if (res.step >= 6) setCurrentStep(5);

            if (res.isTerminal) {
              if (res.status === 'COMPLETED') {
                router.push('/dashboard/swap/success');
              } else if (res.status === 'FAILED') {
                setError('Transaction failed');
              }
              return;
            }
          }
        } catch (err) {
          console.warn('Poll error:', err);
        }
      } else {
        // Fallback simulation if no backend transaction was created
        setCurrentStep((prev) => {
          if (prev < 5) return prev + 1;
          router.push('/dashboard/swap/success');
          return 5;
        });
      }
    };

    const interval = setInterval(poll, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [hasSigned, txId, router]);

  const handleSignMessage = async () => {
    setIsSigning(true);
    let signature = '';
    if (signMessage) {
      try {
        signature = await signMessage();
      } catch (err) {
        console.error(err);
      }
    } else {
      await new Promise((r) => setTimeout(r, 800));
      signature = `sig_merchant_${Date.now()}`;
    }

    if (txId) {
      try {
        const { offrampApi } = await import('@/services/api/offrampApi');
        await offrampApi.submit(txId, signature || `sig_${Date.now()}`);
      } catch (err) {
        console.warn('Submit offramp error:', err);
      }
    }

    setIsSigning(false);
    setHasSigned(true);
    setShowSignModal(false);
    setCurrentStep(3);
  };

  const walletAddr = merchant?.walletAddress || '7xK9VqBfLmN4wE2rP1zT8uY5kQ3mP8wB9qY8uN29Pq8';

  return (
    <DashboardLayout pageTitle="Processing Swap">
      <PageTransition className="max-w-xl mx-auto space-y-6 pt-4">
        
        {/* Processing Card */}
        <div className="bg-white dark:bg-[#0f172a]/95 border border-gray-200 dark:border-purple-500/20 rounded-3xl p-6 sm:p-10 shadow-xl shadow-purple-500/5 backdrop-blur-xl relative overflow-hidden text-center">
          
          {/* Animated Spinner or Check Icon */}
          <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            {currentStep === 2 && !hasSigned ? (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-purple-500/25 ring-4 ring-purple-500/20 animate-bounce">
                <FileSignature size={30} />
              </div>
            ) : (
              <>
                <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 animate-ping opacity-25" />
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-purple-500/20">
                  <Loader2 className="animate-spin" size={32} />
                </div>
              </>
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
            {currentStep === 2 && !hasSigned ? 'Signature Required' : 'Swapping your crypto'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
            {currentStep === 2 && !hasSigned
              ? 'Please sign the authorization message to broadcast the swap'
              : `Processing payout of ${fiat.symbol}${netFiat.toLocaleString()} to ${account.bankName}`}
          </p>

          {/* Sequential Step Timeline */}
          <div className="space-y-3.5 text-left max-w-md mx-auto mb-6">
            {steps.map((step, idx) => {
              const isCompleted = idx < currentStep || (idx === 2 && hasSigned);
              const isCurrent = idx === currentStep && !(idx === 2 && hasSigned);

              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex items-start gap-3.5 p-3 rounded-2xl transition-all ${
                    isCurrent
                      ? 'bg-purple-50 dark:bg-purple-950/40 border border-purple-400 dark:border-purple-600 ring-2 ring-purple-500/10'
                      : isCompleted
                      ? 'bg-gray-50/70 dark:bg-slate-900/60 border border-gray-100 dark:border-white/5'
                      : 'opacity-40 border border-transparent'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 size={18} className="text-emerald-500" />
                    ) : isCurrent ? (
                      <Loader2 size={18} className="text-purple-600 dark:text-teal-400 animate-spin" />
                    ) : (
                      <Circle size={18} className="text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-xs sm:text-sm font-bold ${
                          isCompleted
                            ? 'text-gray-900 dark:text-white'
                            : isCurrent
                            ? 'text-purple-700 dark:text-purple-300'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {step.label}
                      </p>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                          {idx === 2 && !hasSigned ? 'Waiting for Sign' : 'Processing'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Active "Sign Message" CTA Trigger if on Step 2 and modal is closed */}
          {currentStep === 2 && !hasSigned && !showSignModal && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSignModal(true)}
              className="w-full max-w-md mx-auto py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-xl shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer mb-4"
            >
              <FileSignature size={18} />
              <span>Open Sign Message Modal</span>
            </motion.button>
          )}

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 dark:text-gray-500 mt-4">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Non-custodial routing. Blockchain transaction hash will be generated upon confirmation.</span>
          </div>

        </div>

      </PageTransition>

      {/* SIGN MESSAGE MODAL */}
      <AnimatePresence>
        {showSignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-purple-500/30 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4"
            >
              {/* Modal Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-white/10">
                <div className="w-10 h-10 rounded-2xl bg-purple-600/10 dark:bg-purple-950/60 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <FileSignature size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">
                    Sign Message Authorization
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Approve swap & fiat transfer request
                  </p>
                </div>
              </div>

              {/* Wallet info chip */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-slate-900/80 border border-gray-200 dark:border-white/10 text-xs">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Signing Wallet:</span>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-300">
                  {walletAddr.slice(0, 6)}...{walletAddr.slice(-6)}
                </span>
              </div>

              {/* Payload Message Preview Box */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Message Payload to Sign
                </label>
                <div className="p-3.5 rounded-xl bg-gray-900 text-gray-200 font-mono text-[11px] leading-relaxed border border-gray-800 space-y-1 max-h-40 overflow-y-auto">
                  <p className="text-emerald-400 font-bold">// FluxPay Non-Custodial Swap Authorization</p>
                  <p>Action: SWAP_AND_PAYOUT</p>
                  <p>Selling: {numCrypto} {token.symbol}</p>
                  <p>Receiving: {fiat.symbol}{netFiat.toLocaleString()}</p>
                  <p>Recipient: {account.accountName}</p>
                  <p>Destination: {account.bankName} ({account.accountNumber})</p>
                  <p className="text-gray-400">Nonce: FP-8X294B91-AUTH</p>
                  <p className="text-gray-400">Timestamp: 2026-09-24 23:59:00 UTC</p>
                </div>
              </div>

              {/* Security info */}
              <div className="flex items-start gap-2 text-[11px] text-gray-500 dark:text-gray-400 p-2 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/30">
                <Lock size={14} className="text-purple-500 shrink-0 mt-0.5" />
                <span>
                  Signing verifies your wallet identity and unlocks instant settlement to your Nigerian bank account.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSignModal(false)}
                  className="py-3 px-4 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04] font-bold text-xs transition-colors"
                >
                  Cancel
                </button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSignMessage}
                  disabled={isSigning}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isSigning ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Signing...</span>
                    </>
                  ) : (
                    <>
                      <FileSignature size={14} />
                      <span>Sign Message</span>
                    </>
                  )}
                </motion.button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
}
