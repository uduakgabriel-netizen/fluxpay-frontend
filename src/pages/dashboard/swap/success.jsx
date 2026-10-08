import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { CheckCircle2, Copy, Check, ArrowRight, ShieldCheck, Building2 } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/layout';
import PageTransition from '@/components/shared/PageTransition';
import { useToast } from '@/components/shared/Toast';
import { useConsumer } from '@/contexts/ConsumerContext';
import { offrampApi } from '@/services/api/offrampApi';

export default function MerchantSwapSuccessPage() {
  const router = useRouter();
  const toast = useToast();
  const { selectedToken, cryptoAmount, selectedFiat, selectedAccount, activeQuote } = useConsumer();
  const [copied, setCopied] = useState(false);
  const [txDetails, setTxDetails] = useState(null);

  const txId = (router.query.txId && typeof router.query.txId === 'string')
    ? router.query.txId
    : '';

  useEffect(() => {
    if (!txId) return;
    offrampApi
      .getById(txId)
      .then((res) => {
        if (res) setTxDetails(res);
      })
      .catch((err) => {
        console.warn('[MerchantSwapSuccess] Could not fetch tx details:', err);
      });
  }, [txId]);

  const token = selectedToken || { symbol: txDetails?.sourceToken || 'SOL' };
  const fiat = selectedFiat || { symbol: '₦', code: txDetails?.fiatCurrency || 'NGN' };
  const account = selectedAccount || txDetails?.bankAccount || {
    bankName: 'Bank Account',
    accountNumber: '',
    accountName: '',
  };

  const netAmount = txDetails?.netAmount || activeQuote?.netAmount || 0;

  const handleCopy = () => {
    if (!txId) return;
    navigator.clipboard.writeText(txId);
    setCopied(true);
    toast.success(`Copied transaction ID to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
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
            Funds successfully dispatched to your bank
          </p>

          {/* Amount Display */}
          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#1e1b4b]/40 border border-gray-200 dark:border-purple-500/20 mb-6">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Total Payout</p>
            <p className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white my-1">
              {fiat.symbol}{Number(netAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            {account.bankName && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Sent to {account.bankName} {account.accountNumber ? `· ${account.accountNumber}` : ''}
              </p>
            )}
          </div>

          {/* Transaction ID Pill */}
          {txId && (
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 flex items-center justify-between text-xs mb-6">
              <span className="text-gray-500 dark:text-gray-400">Transaction ID:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-gray-900 dark:text-white">{txId}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBackToDashboard}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#8B5CF6] via-indigo-600 to-[#7C3AED] hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-base shadow-xl shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>RETURN TO DASHBOARD</span>
              <ArrowRight size={18} />
            </motion.button>

            <Link
              href="/dashboard/settlements"
              className="block py-3 text-xs font-semibold text-purple-600 dark:text-teal-400 hover:underline"
            >
              View in Settlements History →
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 dark:text-gray-500 mt-6 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Bank transfer reference generated by payment provider.</span>
          </div>

        </motion.div>

      </PageTransition>
    </DashboardLayout>
  );
}
