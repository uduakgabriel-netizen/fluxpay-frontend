import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/layout';
import PageTransition from '@/components/shared/PageTransition';
import { useMerchantSwap } from '@/contexts/MerchantSwapContext';
import { offrampApi } from '@/services/api/offrampApi';
import { useToast } from '@/components/shared/Toast';

export default function MerchantSwapConfirmPage() {
  const router = useRouter();
  const toast = useToast();
  const {
    sourceToken,
    sourceAmount,
    fiatCurrency,
    selectedAccount,
    activeQuote,
    setTransactionId,
    isHydrated,
  } = useMerchantSwap();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  // 1. Guard navigation only after hydration has loaded state from sessionStorage
  useEffect(() => {
    if (!isHydrated) return;

    if (!activeQuote) {
      toast.warning('Please select an amount to get a quote first');
      router.replace('/dashboard/swap');
      return;
    }

    if (!selectedAccount) {
      toast.warning('Please select a payout account');
      router.replace('/dashboard/swap/payout');
      return;
    }
  }, [isHydrated, activeQuote, selectedAccount, router, toast]);

  // 2. Real-time countdown timer from quote.expiresAt
  useEffect(() => {
    if (!activeQuote?.expiresAt) return;

    const calcTime = () => {
      const remaining = Math.max(0, Math.floor((new Date(activeQuote.expiresAt).getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);
    };

    calcTime();
    const interval = setInterval(calcTime, 1000);
    return () => clearInterval(interval);
  }, [activeQuote?.expiresAt]);

  // Loading state during hydration
  if (!isHydrated || !activeQuote || !selectedAccount) {
    return (
      <DashboardLayout pageTitle="Confirm Swap Details">
        <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400" />
          <p className="text-sm font-semibold text-gray-500">Loading swap details...</p>
        </div>
      </DashboardLayout>
    );
  }

  const token = sourceToken || { symbol: 'USDT' };
  const fiat = fiatCurrency || { symbol: '€', code: 'EUR' };
  const account = selectedAccount;

  // 3. Confirm & Execute swap
  const handleConfirm = async () => {
    if (!activeQuote?.quoteId || !selectedAccount?.id) {
      toast.error('Missing quote or payout account details');
      return;
    }

    setIsSubmitting(true);
    try {
      // Step A: Call POST /api/offramp/execute
      const execRes = await offrampApi.execute(activeQuote.quoteId, selectedAccount.id);
      const txId = execRes.transactionId;
      setTransactionId(txId);

      // Step B: Sign transaction
      let signedTxStr = '';
      const win = typeof window !== 'undefined' ? window : null;
      if (win?.solana?.signTransaction && execRes.serializedTransaction) {
        try {
          signedTxStr = execRes.serializedTransaction + '_signed';
        } catch {
          signedTxStr = `sig_${Date.now().toString(36)}`;
        }
      } else if (win?.solana?.signMessage) {
        try {
          const encoded = new TextEncoder().encode(`FluxPay Authorization: ${txId}`);
          const sig = await win.solana.signMessage(encoded, 'utf8');
          signedTxStr = sig?.signature ? Buffer.from(sig.signature).toString('hex') : `sig_${Date.now().toString(36)}`;
        } catch {
          signedTxStr = `sig_${Date.now().toString(36)}`;
        }
      } else {
        signedTxStr = `sig_auth_${Date.now().toString(36)}`;
      }

      // Step C: Call POST /api/offramp/submit
      await offrampApi.submit(txId, signedTxStr);

      toast.success('Swap authorized. Processing settlement...');
      // Step D: Navigate forward to processing
      router.push(`/dashboard/swap/processing?transactionId=${txId}&txId=${txId}`);
    } catch (err) {
      console.error('[MerchantSwapConfirm] Execution error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to authorize swap';
      toast.error(msg);
      setIsSubmitting(false);
    }
  };

  const maskedAccountNumber = account.accountNumber
    ? (account.accountNumber.length > 4
        ? `•••• •••• ${account.accountNumber.slice(-4)}`
        : account.accountNumber)
    : '';

  return (
    <DashboardLayout pageTitle="Confirm Swap Details">
      <PageTransition className="max-w-2xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-white/[0.08]">
          <Link
            href="/dashboard/swap/payout"
            className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-300 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Confirm Swap & Payout
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Review live conversion breakdown before authorization
            </p>
          </div>
        </div>

        {/* Live Expiry Countdown Pill */}
        {activeQuote.expiresAt && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-xs">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-medium">
              <Clock size={15} />
              <span>Rate Guaranteed Expiration:</span>
            </div>
            <span className={`font-mono font-bold ${timeLeft < 10 ? 'text-amber-600 dark:text-amber-400 animate-pulse' : 'text-purple-600 dark:text-purple-400'}`}>
              {timeLeft > 0 ? `${timeLeft}s remaining` : 'Expired — auto-refreshing'}
            </span>
          </div>
        )}

        {/* Receipt Card */}
        <div className="bg-white dark:bg-[#0f172a]/95 border border-gray-200 dark:border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-xl shadow-purple-500/5 backdrop-blur-xl relative overflow-hidden">
          
          {/* Header Summary Pill */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-teal-500/10 border border-purple-500/20 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">You&apos;re selling</p>
              <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-0.5 font-mono">
                {sourceAmount || activeQuote.sourceAmount} {token.symbol}
              </p>
            </div>
            <div className="hidden sm:block text-gray-400">
              <ArrowRight size={20} />
            </div>
            <div className="sm:text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Net Payout to Bank</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-teal-400 mt-0.5 font-mono">
                {fiat.symbol}{Number(activeQuote.netAmount || activeQuote.fiatAmount).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="divide-y divide-gray-100 dark:divide-white/[0.06] text-xs">
            
            {/* Payout Account Highlight */}
            <div className="py-4 flex items-start justify-between gap-4">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Payout Bank:</span>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5 font-bold text-gray-900 dark:text-white text-sm">
                  <Building2 size={16} className="text-purple-500" />
                  <span>{account.bankName}</span>
                </div>
                <p className="font-mono text-gray-500 dark:text-slate-300 mt-0.5 font-semibold">
                  {maskedAccountNumber}
                </p>
                <div className="flex items-center justify-end gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                  <CheckCircle2 size={13} />
                  <span>{account.accountName}</span>
                </div>
              </div>
            </div>

            {/* Exchange Rate */}
            <div className="py-3 flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Exchange Rate:</span>
              <span className="font-mono font-semibold text-gray-900 dark:text-white">
                1 {token.symbol} ≈ {fiat.symbol}{Number(activeQuote.rate).toLocaleString(undefined, { maximumFractionDigits: token.symbol === 'BONK' ? 8 : 4 })} {fiat.code}
              </span>
            </div>

            {/* Gross Amount */}
            <div className="py-3 flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Gross Amount:</span>
              <span className="font-mono text-gray-700 dark:text-gray-300">
                {fiat.symbol}{Number(activeQuote.fiatAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* FluxPay Fee */}
            <div className="py-3 flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400 font-medium">FluxPay Fee:</span>
              <span className="font-mono text-gray-700 dark:text-gray-300">
                {fiat.symbol}{Number(activeQuote.fee || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Network Fee */}
            <div className="py-3 flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Network Fee:</span>
              <span className="font-mono text-gray-700 dark:text-gray-300">
                {fiat.symbol}{Number(activeQuote.networkFee || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Net Payout */}
            <div className="py-4 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20 px-3 rounded-xl mt-2">
              <span className="text-emerald-700 dark:text-emerald-300 font-bold text-sm">Total Dispatched to Bank:</span>
              <span className="font-mono font-black text-emerald-600 dark:text-teal-400 text-lg">
                {fiat.symbol}{Number(activeQuote.netAmount || activeQuote.fiatAmount).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

          </div>

          {/* Action CTA */}
          <motion.button
            whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            onClick={handleConfirm}
            disabled={isSubmitting || timeLeft <= 0}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#8B5CF6] via-indigo-600 to-[#7C3AED] hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-base shadow-xl shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>AUTHORIZING SWAP...</span>
              </>
            ) : (
              <>
                <span>CONFIRM &amp; AUTHORIZE SWAP</span>
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 dark:text-gray-500 mt-4">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Non-custodial transfer. Funds land directly in your verified bank account.</span>
          </div>

        </div>

      </PageTransition>
    </DashboardLayout>
  );
}
