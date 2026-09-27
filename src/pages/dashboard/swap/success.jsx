import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Copy, Check, ExternalLink, ArrowRight, ShieldCheck } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/layout';
import PageTransition from '@/components/shared/PageTransition';
import { useToast } from '@/components/shared/Toast';
import { useConsumer, TOKENS, FIATS, INITIAL_BANK_ACCOUNTS } from '@/contexts/ConsumerContext';

export default function MerchantSwapSuccessPage() {
  const router = useRouter();
  const toast = useToast();
  const { selectedToken, cryptoAmount, selectedFiat, selectedAccount, bankAccounts } = useConsumer();
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const tokenList = TOKENS || [];
  const fiatList = FIATS || [];
  const accounts = (bankAccounts && bankAccounts.length > 0) ? bankAccounts : (INITIAL_BANK_ACCOUNTS || []);

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
  const fluxFee = Math.round(grossFiat * 0.01);
  const netFiat = Math.max(0, grossFiat - fluxFee - 12);
  const txId = 'FP-8X29K4L9M';
  const provider = account?.bankName?.includes('OPay') ? 'OPay' : account?.bankName || 'OPay';

  const handleCopy = () => {
    navigator.clipboard.writeText(txId);
    setCopied(true);
    toast.success(`Copied ${txId} to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBackToDashboard = () => {
    router.push({
      pathname: '/dashboard',
      query: {
        swapSuccess: 'true',
        amount: netFiat.toString(),
        provider,
      },
    });
  };

  return (
    <DashboardLayout pageTitle="Swap Complete">
      <PageTransition className="max-w-xl mx-auto space-y-6 pt-4">
        
        {/* Success Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-[#0f172a]/90 border border-gray-200 dark:border-purple-500/20 rounded-3xl p-6 sm:p-10 shadow-xl shadow-purple-500/5 backdrop-blur-xl relative overflow-hidden text-center"
        >
          {/* Animated Glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Success Checkmark Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <CheckCircle2 size={44} />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-2 flex items-center justify-center gap-2">
            Swap Complete
          </h2>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-6">
            Funds successfully transferred to your bank
          </p>

          {/* Amount Display */}
          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#1e1b4b]/40 border border-gray-200 dark:border-purple-500/20 mb-6">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Total Payout</p>
            <p className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white my-1">
              {fiat.symbol}{netFiat.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Sent to {account?.bankName || 'OPay'} · {account?.accountNumber || '080XXXXXXXX'}
            </p>
          </div>

          {/* Transaction ID Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 text-xs mb-8">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Transaction ID:</span>
            <span className="font-mono font-bold text-gray-900 dark:text-white">{txId}</span>
            <button
              onClick={handleCopy}
              className="text-purple-600 dark:text-teal-400 hover:scale-110 transition-transform ml-1"
              title="Copy ID"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            </button>
          </div>

          {/* Actions Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="py-3.5 px-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-600 font-bold text-xs text-slate-700 dark:text-slate-200 transition-all flex items-center justify-center gap-1.5 hover:bg-gray-50 dark:hover:bg-white/[0.02]"
            >
              <span>View Transaction</span>
              <ExternalLink size={14} />
            </button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBackToDashboard}
              className="py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#8B5CF6] via-indigo-600 to-[#7C3AED] hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Back to Dashboard</span>
              <ArrowRight size={14} />
            </motion.button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 dark:text-gray-500 mt-6">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Digital receipt has been archived in your merchant activity log.</span>
          </div>

        </motion.div>

      </PageTransition>

      {/* Transaction Details Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-gray-900 dark:text-white">Transaction Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-white/[0.06] text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Sold:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{numCrypto} {token.symbol}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Payout:</span>
                  <span className="font-bold text-emerald-600 dark:text-teal-400">{fiat.symbol}{netFiat.toLocaleString()}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Bank:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{account?.bankName || 'OPay'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Account:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{account?.accountNumber || '080XXXXXXXX'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Recipient:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{account?.accountName || 'UDUAK GABRIEL AKPAN'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Status:</span>
                  <span className="font-bold text-emerald-600">CONFIRMED</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Date:</span>
                  <span className="text-gray-700 dark:text-gray-300">{new Date().toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
}
