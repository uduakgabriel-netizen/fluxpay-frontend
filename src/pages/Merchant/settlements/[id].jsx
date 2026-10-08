import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  Copy,
  Check,
  Building2,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/layout';
import PageTransition from '@/components/shared/PageTransition';
import SettlementStatusBadge from '@/components/settlements/SettlementStatusBadge';
import IncludedPaymentsList from '@/components/settlements/IncludedPaymentsList';
import Skeleton from '@/components/shared/Skeleton';
import ErrorCard from '@/components/shared/ErrorCard';
import { useMerchantSettlement } from '@/contexts/MerchantSettlementContext';
import { useToast } from '@/components/shared/Toast';

export default function SettlementDetailPage() {
  const router = useRouter();
  const toast = useToast();
  const { id } = router.query;
  const { getSettlement, settlements } = useMerchantSettlement();

  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiSettlement, setApiSettlement] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    import('@/services/api/merchantSettlementsApi').then(({ merchantSettlementsApi }) => {
      merchantSettlementsApi.getById(id).then((s) => {
        if (!s) return;
        const sym = s.currency === 'USD' ? '$' : s.currency === 'EUR' ? '€' : '₦';
        const statusFormatted =
          s.status === 'COMPLETED'
            ? 'Completed'
            : s.status === 'FAILED'
            ? 'Failed'
            : s.status === 'PROCESSING'
            ? 'Processing'
            : 'Pending';
        const bankName = s.bankAccount?.bankName || 'Bank Account';
        const accNum = s.bankAccount?.accountNumber || '';
        const accHolder = s.bankAccount?.accountName || 'FluxPay Merchant';
        const createdDate = s.createdAt
          ? new Date(s.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          : 'Recent';
        const settledDate = s.settledAt
          ? new Date(s.settledAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          : createdDate;
        setApiSettlement({
          id: s.id,
          date: createdDate,
          fiatAmount: `${sym}${Number(s.grossAmount || s.fiatAmount || 0).toLocaleString()}`,
          fiatCurrency: s.currency || 'NGN',
          cryptoReceived: `${s.paymentCount || 1} payment(s)`,
          rate: s.fxRate ? `1 SOL ≈ ${sym}${Number(s.fxRate).toLocaleString()}` : '',
          provider: s.provider || 'Bank Transfer',
          destinationAccount: `${bankName} · ${accNum}`,
          recipientName: accHolder,
          status: statusFormatted,
          fluxPayFee: `${sym}${Number(s.fee || 0).toLocaleString()}`,
          networkFee: `${sym}${Number(s.networkFee || 0).toLocaleString()}`,
          netToBank: `${sym}${Number(s.netAmount || 0).toLocaleString()}`,
          reference: s.providerRefId || s.id,
          settledDate,
          includedPayments: Array.isArray(s.payments)
            ? s.payments.map((p, idx) => ({
                id: p.id || `ORD-${idx + 1}`,
                cryptoAmount: `${p.amount || '0'} SOL`,
                fiatAmount: `${sym}${Number(p.fiatAmount || p.amount || 0).toLocaleString()}`,
                customer: p.customerWallet ? `${p.customerWallet.slice(0, 4)}...${p.customerWallet.slice(-4)}` : 'Customer',
                date: p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Recent',
              }))
            : [],
        });
      }).catch((err) => {
        console.warn('Could not fetch settlement from API:', err);
      });
    });
  }, [id]);

  const fallbackSettlement = {
    id: typeof id === 'string' ? id : 'SET-DETAILS',
    date: 'Recent',
    fiatAmount: '₦0',
    fiatCurrency: 'NGN',
    cryptoReceived: '0 payment(s)',
    rate: '',
    provider: 'Bank Transfer',
    destinationAccount: 'Bank Account',
    recipientName: 'FluxPay Merchant',
    status: 'Pending',
    fluxPayFee: '₦0',
    networkFee: '₦0',
    netToBank: '₦0',
    reference: typeof id === 'string' ? id : '',
    settledDate: 'Recent',
    includedPayments: [],
  };

  // Retrieve settlement or fallback to first one if ID is still resolving during SSR/hydration
  const settlement =
    apiSettlement ||
    getSettlement(id) ||
    settlements.find((s) => s.id === id) ||
    settlements[0] ||
    fallbackSettlement;

  const handleCopyRef = () => {
    if (settlement?.reference) {
      navigator.clipboard.writeText(settlement.reference);
      setCopied(true);
      toast.info('Reference copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadReceipt = () => {
    if (!settlement) return;
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      // Create a downloadable text receipt
      const content = `FLUXPAY SETTLEMENT RECEIPT\n--------------------------\nSettlement ID: ${settlement.id}\nReference: ${settlement.reference}\nStatus: ${settlement.status}\nDate: ${settlement.settledDate}\n\nCrypto Received: ${settlement.cryptoReceived}\nExchange Rate: ${settlement.rate}\nGross Fiat: ${settlement.fiatAmount}\nFluxPay Fee: ${settlement.fluxPayFee}\nNetwork Fee: ${settlement.networkFee}\nNet Transferred: ${settlement.netToBank}\n\nDestination: ${settlement.destinationAccount}\nRecipient: ${settlement.recipientName}\nProvider: ${settlement.provider}\n--------------------------\nThank you for using FluxPay.`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `FluxPay-Settlement-${settlement.id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Settlement receipt downloaded');
    }, 700);
  };

  if (!settlement && !loading) {
    return (
      <DashboardLayout pageTitle="Settlement Detail">
        <div className="py-8 max-w-lg mx-auto">
          <ErrorCard
            type="default"
            title="Settlement not found"
            message={`We could not locate settlement batch "${id}". It may have been archived or removed.`}
            actionLabel="Return to Settlements"
            onRetry={() => router.push('/dashboard/settlements')}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle={`Settlement ${settlement?.id || ''}`}>
      <PageTransition className="space-y-6 max-w-3xl">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/settlements"
              className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Settlement
                </h2>
                <SettlementStatusBadge status={settlement.status} />
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Batch ID: {settlement.id}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadReceipt}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-purple-500/20 text-xs font-bold text-slate-900 dark:text-white shadow-xs transition-all cursor-pointer shrink-0 disabled:opacity-50"
          >
            <Download size={14} className={downloading ? 'animate-bounce' : ''} />
            <span className="hidden sm:inline">
              {downloading ? 'Preparing...' : 'Download Receipt'}
            </span>
          </button>
        </div>

        {/* Hero Amount Banner */}
        {loading ? (
          <div className="rounded-3xl p-6 sm:p-7 bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-purple-500/20 space-y-3">
            <Skeleton variant="text" width="120px" />
            <Skeleton variant="text" width="180px" height="36px" />
            <Skeleton variant="text" width="220px" height="14px" />
          </div>
        ) : (
          <div className="rounded-3xl p-6 sm:p-7 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-purple-500/20 shadow-xl shadow-purple-500/5 relative overflow-hidden">
            <div className="space-y-2">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Total Amount Settled
              </span>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {settlement.fiatAmount}
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <Building2 size={15} className="text-[#8B5CF6] shrink-0" />
                <span>Sent to {settlement.destinationAccount}</span>
                <span className="text-slate-400">·</span>
                <span className="font-semibold">{settlement.recipientName}</span>
              </div>
            </div>
          </div>
        )}

        {/* Breakdown Card */}
        <div className="rounded-2xl p-6 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-purple-500/20 shadow-lg shadow-purple-500/5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Breakdown
          </h3>
          {loading ? (
            <div className="space-y-3 py-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton variant="text" width="110px" />
                  <Skeleton variant="text" width="90px" />
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/[0.04] text-xs sm:text-sm">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Crypto received:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {settlement.cryptoReceived}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Converted to:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {settlement.fiatAmount}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Rate:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {settlement.rate}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">FluxPay fee:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {settlement.fluxPayFee}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Network fee:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {settlement.networkFee}
                </span>
              </div>
              <div className="pt-3 pb-1 flex items-center justify-between text-sm sm:text-base font-bold">
                <span className="text-slate-900 dark:text-white">Net to bank:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  {settlement.netToBank}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Included Payments Card */}
        <div className="rounded-2xl p-6 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-purple-500/20 shadow-lg shadow-purple-500/5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Included Payments
            </h3>
            <span className="text-xs font-semibold text-slate-400">
              {settlement.includedPayments?.length || 0} customer payments
            </span>
          </div>

          <IncludedPaymentsList payments={settlement.includedPayments} />
        </div>

        {/* Metadata & Provider Details */}
        <div className="rounded-2xl p-6 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-purple-500/20 shadow-lg shadow-purple-500/5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 dark:text-slate-500 font-semibold block uppercase tracking-wider text-[10px] mb-1">
                Provider
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {settlement.provider}
              </span>
            </div>

            <div>
              <span className="text-slate-400 dark:text-slate-500 font-semibold block uppercase tracking-wider text-[10px] mb-1">
                Reference
              </span>
              <div className="flex items-center gap-1.5 font-mono text-slate-900 dark:text-white font-medium">
                <span>{settlement.reference}</span>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="p-1 hover:text-[#8B5CF6] transition-colors"
                  title="Copy reference"
                >
                  {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            <div>
              <span className="text-slate-400 dark:text-slate-500 font-semibold block uppercase tracking-wider text-[10px] mb-1">
                Settled Date
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {settlement.settledDate}
              </span>
            </div>
          </div>
        </div>

        {/* Download Receipt Button Bottom */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleDownloadReceipt}
            disabled={downloading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white text-sm font-bold shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Download size={16} className={downloading ? 'animate-bounce' : ''} />
            <span>{downloading ? 'Generating Receipt...' : 'Download Receipt'}</span>
          </button>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
