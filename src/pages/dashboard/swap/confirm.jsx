import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/layout';
import PageTransition from '@/components/shared/PageTransition';
import { useConsumer } from '@/contexts/ConsumerContext';

export default function MerchantSwapConfirmPage() {
  const router = useRouter();
  const {
    selectedToken,
    cryptoAmount,
    selectedFiat,
    selectedAccount,
    activeQuote,
  } = useConsumer();

  // If user arrives without quote or account, redirect back
  useEffect(() => {
    if (!activeQuote || !selectedAccount) {
      router.replace('/dashboard/swap');
    }
  }, [activeQuote, selectedAccount, router]);

  if (!activeQuote || !selectedAccount) {
    return null;
  }

  const token = selectedToken || { symbol: 'SOL' };
  const fiat = selectedFiat || { symbol: '₦', code: 'NGN' };
  const account = selectedAccount;

  const handleConfirm = () => {
    router.push('/dashboard/swap/processing');
  };

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

        {/* Receipt Card */}
        <div className="bg-white dark:bg-[#0f172a]/95 border border-gray-200 dark:border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-xl shadow-purple-500/5 backdrop-blur-xl relative overflow-hidden">
          
          {/* Header Summary Pill */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-teal-500/10 border border-purple-500/20 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">You&apos;re selling</p>
              <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                {cryptoAmount} {token.symbol}
              </p>
            </div>
            <div className="hidden sm:block text-gray-400">
              <ArrowRight size={20} />
            </div>
            <div className="sm:text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Net Payout to Bank</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-teal-400 mt-0.5">
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
                <p className="font-mono text-gray-500 dark:text-slate-300 mt-0.5 font-bold">
                  {account.accountNumber}
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
                {fiat.symbol}{activeQuote.fee}
              </span>
            </div>

            {/* Network Fee */}
            <div className="py-3 flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Network Fee:</span>
              <span className="font-mono text-gray-700 dark:text-gray-300">
                {fiat.symbol}{activeQuote.networkFee}
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
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirm}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#8B5CF6] via-indigo-600 to-[#7C3AED] hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-base shadow-xl shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-6"
          >
            <span>CONFIRM & AUTHORIZE SWAP</span>
            <span>→</span>
          </motion.button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 dark:text-gray-500 mt-4">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Non-custodial transfer. Funds land directly in your account.</span>
          </div>

        </div>

      </PageTransition>
    </DashboardLayout>
  );
}
