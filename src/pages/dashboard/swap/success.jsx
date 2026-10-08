import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Building2,
  ExternalLink,
  Clock,
  Loader2,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/layout';
import PageTransition from '@/components/shared/PageTransition';
import { useToast } from '@/components/shared/Toast';
import { useMerchantSwap } from '@/contexts/MerchantSwapContext';
import { offrampApi } from '@/services/api/offrampApi';

export default function MerchantSwapSuccessPage() {
  const router = useRouter();
  const toast = useToast();
  const {
    sourceToken,
    fiatCurrency,
    selectedAccount,
    activeQuote,
    transactionId: contextTxId,
    resetSwapFlow,
    isHydrated,
  } = useMerchantSwap();

  const [copiedId, setCopiedId] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [txDetails, setTxDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Extract transactionId from query or context
  const txId = (
    router.query.transactionId ||
    router.query.txId ||
    contextTxId ||
    ''
  ).toString().trim();

  // Fetch real transaction details from backend
  useEffect(() => {
    if (!router.isReady || !isHydrated) return;

    if (!txId) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    setIsLoading(true);

    offrampApi
      .getById(txId)
      .then((res) => {
        if (!mounted) return;
        if (res) {
          setTxDetails(res);
        }
      })
      .catch((err) => {
        if (!mounted) return;
        console.warn('[MerchantSwapSuccess] Failed to fetch transaction details:', err);
        setError('Could not fetch full receipt details from backend.');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [router.isReady, isHydrated, txId]);

  const getCurrencySymbol = (code) => {
    switch (code?.toUpperCase()) {
      case 'NGN':
        return '₦';
      case 'EUR':
        return '€';
      case 'USD':
        return '$';
      case 'GBP':
        return '£';
      case 'KES':
        return 'KSh';
      case 'GHS':
        return 'GH₵';
      default:
        return code || '€';
    }
  };

  const maskAccountNumber = (num) => {
    if (!num) return '';
    const str = String(num);
    if (str.includes('•')) return str;
    return str.length > 4 ? `•••• •••• ${str.slice(-4)}` : str;
  };

  const handleCopyId = () => {
    if (!txId) return;
    navigator.clipboard.writeText(txId);
    setCopiedId(true);
    toast.success('Copied Transaction ID to clipboard');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyRef = () => {
    const ref = txDetails?.payoutRefId || '';
    if (!ref) return;
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    toast.success('Copied Payout Reference to clipboard');
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleBackToDashboard = () => {
    resetSwapFlow();
    router.push('/dashboard');
  };

  if (!isHydrated || !router.isReady || (isLoading && !txDetails)) {
    return (
      <DashboardLayout pageTitle="Swap Complete">
        <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400" />
          <p className="text-sm font-semibold text-gray-500">Loading transaction receipt...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Derive display values from real backend transaction, falling back to context
  const fiatCode = txDetails?.fiatCurrency || fiatCurrency?.code || activeQuote?.fiatCurrency || 'EUR';
  const currencySymbol = fiatCurrency?.symbol || getCurrencySymbol(fiatCode);
  const netAmount = txDetails?.netAmount || activeQuote?.netAmount || txDetails?.fiatAmount || activeQuote?.fiatAmount || '0';
  const tokenSymbol = txDetails?.sourceToken || sourceToken?.symbol || activeQuote?.sourceToken || 'USDT';
  const tokenAmount = txDetails?.sourceAmount || activeQuote?.sourceAmount || '';

  const bankName = txDetails?.bankAccount?.bankName || selectedAccount?.bankName || 'Bank Account';
  const accountHolder = txDetails?.bankAccount?.accountName || selectedAccount?.accountName || '';
  const rawAccountNumber = txDetails?.bankAccount?.accountNumber || selectedAccount?.accountNumber || '';
  const maskedAcc = maskAccountNumber(rawAccountNumber);

  const swapTxHash = txDetails?.swapTxHash || '';
  const payoutRefId = txDetails?.payoutRefId || '';
  const timestamp = txDetails?.completedAt || txDetails?.createdAt || new Date().toISOString();
  const formattedDate = new Date(timestamp).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <DashboardLayout pageTitle="Swap Complete">
      <PageTransition className="max-w-xl mx-auto space-y-6 pt-4">
        
        {/* Success Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-[#0f172a]/95 border border-gray-200 dark:border-purple-500/20 rounded-3xl p-6 sm:p-10 shadow-xl shadow-purple-500/5 backdrop-blur-xl relative overflow-hidden text-center"
        >
          {/* Animated Glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Success Checkmark Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <CheckCircle2 size={44} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
            Swap &amp; Payout Complete
          </h2>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-6">
            Funds successfully dispatched to your payout bank account
          </p>

          {/* Net Amount Display */}
          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#1e1b4b]/40 border border-gray-200 dark:border-purple-500/20 mb-6">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Net Payout Received</p>
            <p className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-teal-400 font-mono my-1">
              {currencySymbol}{Number(netAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            {tokenAmount && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Converted from <span className="font-mono font-semibold">{tokenAmount} {tokenSymbol}</span>
              </p>
            )}
          </div>

          {/* Real Transaction Details Table */}
          <div className="divide-y divide-gray-100 dark:divide-white/[0.06] text-xs mb-6 text-left">
            
            {/* Payout Destination Account */}
            <div className="py-3 flex items-start justify-between gap-4">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Payout Bank:</span>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5 font-bold text-gray-900 dark:text-white">
                  <Building2 size={15} className="text-purple-500" />
                  <span>{bankName}</span>
                </div>
                {maskedAcc && (
                  <p className="font-mono text-gray-500 dark:text-slate-300 mt-0.5 text-[11px]">
                    {maskedAcc}
                  </p>
                )}
                {accountHolder && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                    {accountHolder}
                  </p>
                )}
              </div>
            </div>

            {/* Transaction Hash with Solscan Link */}
            {swapTxHash && (
              <div className="py-3 flex items-center justify-between gap-4">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Blockchain Hash:</span>
                <a
                  href={`https://solscan.io/tx/${swapTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-purple-600 dark:text-purple-400 hover:underline text-[11px]"
                >
                  <span>{swapTxHash.slice(0, 8)}...{swapTxHash.slice(-6)}</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}

            {/* Payout Reference ID */}
            {payoutRefId && (
              <div className="py-3 flex items-center justify-between gap-4">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Payout Reference:</span>
                <div className="flex items-center gap-1.5 font-mono text-gray-900 dark:text-white">
                  <span>{payoutRefId}</span>
                  <button
                    type="button"
                    onClick={handleCopyRef}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-400 hover:text-gray-700 dark:hover:text-white"
                  >
                    {copiedRef ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            )}

            {/* Transaction ID */}
            {txId && (
              <div className="py-3 flex items-center justify-between gap-4">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Transaction ID:</span>
                <div className="flex items-center gap-1.5 font-mono text-gray-900 dark:text-white">
                  <span>{txId}</span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-400 hover:text-gray-700 dark:hover:text-white"
                  >
                    {copiedId ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            )}

            {/* Timestamp */}
            <div className="py-3 flex items-center justify-between gap-4">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Completed At:</span>
              <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 text-[11px]">
                <Clock size={12} className="text-gray-400" />
                <span>{formattedDate}</span>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBackToDashboard}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#8B5CF6] via-indigo-600 to-[#7C3AED] hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-base shadow-xl shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>BACK TO DASHBOARD</span>
              <ArrowRight size={18} />
            </motion.button>

            <Link
              href="/dashboard/settlements"
              onClick={() => resetSwapFlow()}
              className="block py-3 text-xs font-semibold text-purple-600 dark:text-teal-400 hover:underline"
            >
              View in Settlements History →
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 dark:text-gray-500 mt-6 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Bank settlement verified and recorded on ledger.</span>
          </div>

        </motion.div>

      </PageTransition>
    </DashboardLayout>
  );
}
