import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, ArrowRight, Wallet, Building2, CheckCircle2, FileSignature } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/layout';
import PageTransition from '@/components/shared/PageTransition';
import { useConsumer, TOKENS, FIATS } from '@/contexts/ConsumerContext';

export default function MerchantSwapConfirmPage() {
  const router = useRouter();
  const {
    selectedToken,
    cryptoAmount,
    selectedFiat,
    fiatAmount,
    selectedAccount,
    bankAccounts,
  } = useConsumer();

  const tokenList = TOKENS || [];
  const fiatList = FIATS || [];
  const accounts = (bankAccounts && bankAccounts.length > 0) ? bankAccounts : [];

  const token = selectedToken || tokenList[0] || {
    symbol: 'SOL',
    name: 'Solana',
    rateNgn: 300153,
  };

  const fiat = selectedFiat || fiatList[0] || {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira'
  };

  const account = selectedAccount || accounts[0] || {
    bankName: 'OPay',
    accountNumber: '080XXXXXXXX',
    accountName: 'UDUAK GABRIEL AKPAN',
  };

  const numCrypto = Number(cryptoAmount || 1.5);
  const grossFiat = Math.round(numCrypto * (token.rateNgn || 300153));
  const fluxFee = Math.round(grossFiat * 0.01); // 1%
  const networkFee = 12; // ₦12 network fee
  const netFiat = Math.max(0, grossFiat - fluxFee - networkFee);

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
              Review conversion breakdown before signing authorization
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
                {numCrypto} {token.symbol}
              </p>
            </div>
            <div className="hidden sm:block text-gray-400">
              <ArrowRight size={20} />
            </div>
            <div className="sm:text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Net Payout to Bank</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-teal-400 mt-0.5">
                {fiat.symbol}{netFiat.toLocaleString()}
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
                  <span>{account?.bankName || 'OPay'}</span>
                </div>
                <p className="font-mono text-gray-500 dark:text-slate-300 mt-0.5 font-bold">
                  {account?.accountNumber || '080XXXXXXXX'}
                </p>
                <div className="flex items-center justify-end gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                  <CheckCircle2 size={13} />
                  <span>{account?.accountName || 'UDUAK GABRIEL AKPAN'}</span>
                </div>
              </div>
            </div>

            {/* Exchange Rate */}
            <div className="py-3 flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Exchange Rate:</span>
              <span className="font-mono font-semibold text-gray-900 dark:text-white">
                1 {token.symbol} ≈ {fiat.symbol}{(token.rateNgn || 300153).toLocaleString()}
              </span>
            </div>

            {/* FluxPay Fee */}
            <div className="py-3 flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400 font-medium">FluxPay Fee (1%):</span>
              <span className="font-mono text-gray-700 dark:text-gray-300">
                {fiat.symbol}{fluxFee.toLocaleString()}
              </span>
            </div>

            {/* Network Fee */}
            <div className="py-3 flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Network Gas Fee:</span>
              <span className="font-mono text-gray-700 dark:text-gray-300">
                {fiat.symbol}{networkFee.toLocaleString()}
              </span>
            </div>

            {/* Total Payout */}
            <div className="py-4 flex items-center justify-between text-sm font-bold">
              <span className="text-gray-900 dark:text-white">Total Payout:</span>
              <span className="text-base text-emerald-600 dark:text-teal-400 font-black">
                {fiat.symbol}{netFiat.toLocaleString()}
              </span>
            </div>

          </div>

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirm}
            className="w-full mt-6 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#8B5CF6] via-indigo-600 to-[#7C3AED] hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-base shadow-xl shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileSignature size={18} />
            <span>CONTINUE TO SIGN MESSAGE</span>
            <span>→</span>
          </motion.button>

          {/* Bottom Security Note */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 dark:text-gray-500 mt-4">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Cryptographic signature required on the next step. Zero slippage guarantee.</span>
          </div>

        </div>

      </PageTransition>
    </DashboardLayout>
  );
}
