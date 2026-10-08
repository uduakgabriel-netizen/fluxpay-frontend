import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Loader2,
  Circle,
  Building2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/layout';
import PageTransition from '@/components/shared/PageTransition';
import ErrorCard from '@/components/shared/ErrorCard';
import { useMerchantSwap } from '@/contexts/MerchantSwapContext';
import { offrampApi } from '@/services/api/offrampApi';
import { useToast } from '@/components/shared/Toast';

export default function MerchantSwapProcessingPage() {
  const router = useRouter();
  const toast = useToast();
  const {
    sourceToken,
    sourceAmount,
    fiatCurrency,
    selectedAccount,
    activeQuote,
    transactionId: contextTxId,
    setTransactionId,
    isHydrated,
  } = useMerchantSwap();

  const [currentStep, setCurrentStep] = useState(0);
  const [currentStatus, setCurrentStatus] = useState('PENDING');
  const [statusLabel, setStatusLabel] = useState('Initializing swap...');
  const [error, setError] = useState('');
  const [isPolling, setIsPolling] = useState(true);

  // Read transactionId from query params or context
  const txId = (
    router.query.transactionId ||
    router.query.txId ||
    contextTxId ||
    ''
  ).toString().trim();

  // Keep context in sync if transactionId was in URL
  useEffect(() => {
    if (txId && txId !== contextTxId) {
      setTransactionId(txId);
    }
  }, [txId, contextTxId, setTransactionId]);

  const steps = [
    { label: 'Quote confirmed', desc: 'Guaranteed exchange rate locked' },
    { label: 'Transaction created & signed', desc: 'Solana instructions verified' },
    { label: 'Swapping tokens', desc: 'Instant liquidity pool swap to fiat' },
    { label: 'Crypto swapped', desc: 'Confirmed on Solana blockchain' },
    { label: 'Processing payout', desc: `Dispatched to ${selectedAccount?.bankName || 'Bank'} (${selectedAccount?.accountNumber ? '•••• ' + selectedAccount.accountNumber.slice(-4) : ''})` },
    { label: 'Payout completed', desc: 'Funds received by destination bank' },
  ];

  const mapBackendStepToUI = (backendStep, status) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'AWAITING_SIGNATURE':
        return 1;
      case 'SIGNED':
        return 2;
      case 'SWAPPING':
        return 2;
      case 'SWAPPED':
        return 3;
      case 'PAYOUT_PENDING':
      case 'PAYOUT_PROCESSING':
        return 4;
      case 'COMPLETED':
        return 5;
      case 'FAILED':
      case 'REFUNDED':
        return typeof backendStep === 'number' ? Math.max(0, Math.min(5, backendStep - 1)) : 2;
      default:
        return typeof backendStep === 'number' ? Math.max(0, Math.min(5, backendStep - 1)) : 0;
    }
  };

  // Poll GET /api/offramp/transactions/:id/status every 2 seconds
  useEffect(() => {
    if (!router.isReady || !isHydrated || !txId || !isPolling) return;

    let cancelled = false;
    const startTime = Date.now();

    const pollStatus = async () => {
      if (cancelled) return;

      // 5-minute timeout guard
      if (Date.now() - startTime > 300000) {
        setError('Transaction processing is taking longer than expected. Please check Settlements History.');
        setIsPolling(false);
        return;
      }

      try {
        const res = await offrampApi.getStatus(txId);
        if (cancelled || !res) return;

        const backendStatus = res.status || 'PENDING';
        setCurrentStatus(backendStatus);
        if (res.stepLabel) {
          setStatusLabel(res.stepLabel);
        }

        const uiStep = mapBackendStepToUI(res.step, backendStatus);
        setCurrentStep(uiStep);

        if (res.isTerminal) {
          setIsPolling(false);

          if (backendStatus === 'COMPLETED') {
            setCurrentStep(5);
            toast.success('Payout completed successfully!');
            setTimeout(() => {
              router.push(`/dashboard/swap/success?transactionId=${txId}&txId=${txId}`);
            }, 800);
          } else if (backendStatus === 'FAILED' || backendStatus === 'REFUNDED') {
            const errMsg = res.errorMessage || res.error || 'Transaction failed during processing.';
            setError(errMsg);
            toast.error(errMsg);
          }
        }
      } catch (err) {
        console.warn('[MerchantSwapProcessing] Status poll error:', err);
        // Do not fail immediately on a single transient network error
      }
    };

    // Immediate first poll
    pollStatus();

    // Poll every 2 seconds
    const interval = setInterval(pollStatus, 2000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [router.isReady, isHydrated, txId, isPolling, router, toast]);

  // Loading state while waiting for hydration and router ready
  if (!isHydrated || !router.isReady) {
    return (
      <DashboardLayout pageTitle="Processing Swap">
        <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400" />
          <p className="text-sm font-semibold text-gray-500">Loading swap status...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Missing transactionId error state
  if (!txId) {
    return (
      <DashboardLayout pageTitle="Processing Swap">
        <PageTransition className="max-w-2xl mx-auto space-y-6 pt-4">
          <ErrorCard
            type="network"
            message="No active transaction found to track. Please start a new swap from the dashboard."
            actionLabel="Return to Swap"
            onRetry={() => router.push('/dashboard/swap')}
          />
        </PageTransition>
      </DashboardLayout>
    );
  }

  const tokenSymbol = sourceToken?.symbol || activeQuote?.sourceToken || 'USDT';
  const fiatSymbol = fiatCurrency?.symbol || '€';
  const displayAmount = activeQuote?.netAmount || activeQuote?.fiatAmount || '';

  return (
    <DashboardLayout pageTitle="Processing Swap">
      <PageTransition className="max-w-2xl mx-auto space-y-6 pt-4">
        
        {/* Header Summary */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800">
            {currentStatus === 'COMPLETED' ? 'Settlement Completed' : 'Live Settlement in Progress'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {currentStatus === 'COMPLETED' ? 'Swap Completed Successfully' : 'Sending Payout to Bank'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {txId ? `Tracking transaction ID: ${txId}` : 'Connecting to liquidity providers...'}
          </p>
        </div>

        {/* Error Card or Steps Card */}
        {error ? (
          <div className="p-2 space-y-4">
            <ErrorCard
              type="network"
              message={error}
              actionLabel="Return to Swap"
              onRetry={() => router.push('/dashboard/swap')}
            />
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setIsPolling(true);
                }}
                className="inline-flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
              >
                <RefreshCw size={13} />
                <span>Retry checking status</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0f172a]/90 border border-gray-200 dark:border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            
            {/* Steps Visual List */}
            <div className="space-y-4">
              {steps.map((st, idx) => {
                const isComplete = currentStatus === 'COMPLETED' ? true : currentStep > idx;
                const isCurrent = currentStatus !== 'COMPLETED' && currentStep === idx;
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
            {(selectedAccount || displayAmount) && (
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#1e1b4b]/40 border border-gray-200 dark:border-purple-500/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-purple-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {selectedAccount?.bankName || 'Bank Account'} {selectedAccount?.accountNumber ? `(•••• ${selectedAccount.accountNumber.slice(-4)})` : ''}
                  </span>
                </div>
                {displayAmount && (
                  <span className="font-mono font-bold text-emerald-600 dark:text-teal-400 text-sm">
                    {fiatSymbol}{Number(displayAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                )}
              </div>
            )}

            {/* Real Status Footer */}
            <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-white/[0.06]">
              <span>Status: <strong className="font-mono text-purple-600 dark:text-purple-400">{currentStatus}</strong></span>
              <span>Updated live via Helius &amp; OneLiquidity</span>
            </div>

          </div>
        )}

      </PageTransition>
    </DashboardLayout>
  );
}
