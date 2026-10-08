import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useConsumer } from '@/contexts/ConsumerContext';
import ConsumerLayout from '@/components/Consumer/ConsumerLayout';
import PageTransition from '@/components/shared/PageTransition';
import StatusBadge from '@/components/shared/StatusBadge';
import { useToast } from '@/components/shared/Toast';

export default function TransactionDetails() {
  const router = useRouter();
  const toast = useToast();
  const { id } = router.query;
  const { transactions } = useConsumer();

  const [copiedField, setCopiedField] = useState(null);
  const [detailTx, setDetailTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    setLoading(true);

    const existing = transactions.find((t) => t.id === id);
    if (existing) {
      setDetailTx({
        id: existing.id,
        token: existing.sourceToken || existing.token || 'SOL',
        tokenAmount: existing.sourceAmount || existing.amount || '0',
        fiatAmount: existing.netAmount || existing.fiatAmount || '0',
        currency: existing.fiatCurrency || 'NGN',
        method: existing.provider || 'Bank Transfer',
        destination: existing.bankAccount ? `${existing.bankAccount.bankName} ${existing.bankAccount.accountNumber}` : (existing.accountNumber ? `${existing.bankName || 'Bank'} ${existing.accountNumber}` : 'Bank Account'),
        recipient: existing.bankAccount ? existing.bankAccount.accountName : (existing.accountName || 'Verified Recipient'),
        status: existing.status === 'COMPLETED' ? 'Completed' : existing.status === 'FAILED' ? 'Failed' : 'Processing',
        txHash: existing.swapTxHash || '',
        payoutRef: existing.payoutRefId || existing.id || '',
        date: existing.createdAt ? new Date(existing.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent',
        rate: existing.rate ? `1 ${existing.sourceToken || existing.token || 'SOL'} = ₦${existing.rate}` : '',
        fee: existing.fee ? `₦${existing.fee}` : '',
        networkFee: existing.networkFee ? `₦${existing.networkFee}` : '',
      });
      setLoading(false);
      return;
    }

    import('@/services/api/transactionsApi').then(({ transactionsApi }) => {
      transactionsApi.getById(id).then((t) => {
        if (!t) {
          setError('Transaction not found');
          setLoading(false);
          return;
        }
        setDetailTx({
          id: t.id,
          token: t.sourceToken || 'SOL',
          tokenAmount: t.sourceAmount || '0',
          fiatAmount: t.netAmount || t.fiatAmount || '0',
          currency: t.fiatCurrency || 'NGN',
          method: t.provider || 'Bank Transfer',
          destination: t.bankAccount ? `${t.bankAccount.bankName} ${t.bankAccount.accountNumber}` : (t.accountNumber ? `${t.bankName || 'Bank'} ${t.accountNumber}` : 'Bank Account'),
          recipient: t.bankAccount ? t.bankAccount.accountName : (t.accountName || 'Verified Recipient'),
          status: t.status === 'COMPLETED' ? 'Completed' : t.status === 'FAILED' ? 'Failed' : 'Processing',
          txHash: t.swapTxHash || '',
          payoutRef: t.payoutRefId || t.id || '',
          date: t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent',
          rate: t.rate ? `1 ${t.sourceToken || 'SOL'} = ₦${t.rate}` : '',
          fee: t.fee ? `₦${t.fee}` : '',
          networkFee: t.networkFee ? `₦${t.networkFee}` : '',
        });
        setLoading(false);
      }).catch((err) => {
        console.warn('Could not fetch detailTx from API:', err);
        setError('Failed to load transaction details.');
        setLoading(false);
      });
    });
  }, [id, transactions]);

  const handleCopy = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`Copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <ConsumerLayout title="Receipt Details" backHref="/sell/transactions" maxWidth="max-w-md">
        <div className="rounded-3xl bg-white dark:bg-slate-850 p-8 border border-slate-200/90 dark:border-slate-800 flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-slate-500">Loading transaction details...</p>
        </div>
      </ConsumerLayout>
    );
  }

  if (error || !detailTx) {
    return (
      <ConsumerLayout title="Receipt Details" backHref="/sell/transactions" maxWidth="max-w-md">
        <div className="rounded-3xl bg-white dark:bg-slate-850 p-8 border border-slate-200/90 dark:border-slate-800 text-center space-y-4">
          <i className="ri-error-warning-line text-4xl text-rose-500" />
          <p className="text-base font-bold text-slate-800 dark:text-slate-100">{error || 'Transaction not found'}</p>
          <Link href="/sell/transactions" className="inline-block px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-sm">
            Return to Transactions
          </Link>
        </div>
      </ConsumerLayout>
    );
  }

  const tx = detailTx;

  const rows = [
    { label: 'Source Asset :', value: tx.token },
    { label: 'Payout Destination :', value: tx.destination },
    ...(tx.rate ? [{ label: 'Exchange Rate :', value: tx.rate }] : []),
    ...(tx.fee ? [{ label: 'FluxPay Fee :', value: tx.fee }] : []),
    ...(tx.networkFee ? [{ label: 'Network Fee :', value: tx.networkFee }] : []),
    { label: 'Blockchain Network :', value: 'Solana' },
    ...(tx.txHash ? [{
      label: 'Transaction Hash :',
      value: tx.txHash,
      canCopy: true,
      shortValue: `${tx.txHash.slice(0, 8)}...${tx.txHash.slice(-6)}`
    }] : []),
    ...(tx.payoutRef ? [{
      label: 'Payout Reference :',
      value: tx.payoutRef,
      canCopy: true
    }] : []),
    { label: 'Created Time :', value: tx.date || 'Recent' },
    { label: 'Settlement Status :', value: tx.status || 'Processing' },
  ];

  return (
    <ConsumerLayout title="Receipt Details" backHref="/sell/transactions" maxWidth="max-w-md">
      <PageTransition className="space-y-4">
        <div className="rounded-3xl bg-white dark:bg-slate-850 p-6 sm:p-7 space-y-5 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-purple-500/5">
          {/* Header Summary */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                {tx.tokenAmount} {tx.token} → {tx.currency === 'NGN' ? '₦' : '$'}{tx.fiatAmount}
              </div>
              <span className="text-xs text-slate-400 mt-0.5 block font-mono">ID: {tx.id}</span>
            </div>

            <StatusBadge status={tx.status} />
          </div>

          {/* Details Rows */}
          <div className="space-y-3 text-xs sm:text-sm">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {row.label}
                </span>
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                  <span className="font-mono">{row.shortValue || row.value}</span>
                  {row.canCopy && (
                    <button
                      type="button"
                      onClick={() => handleCopy(row.value, row.label)}
                      className="relative p-1 text-purple-600 dark:text-teal-400 hover:scale-110 transition-transform"
                      title="Copy"
                    >
                      <i className={copiedField === row.label ? "ri-check-line text-emerald-500 font-bold" : "ri-file-copy-line text-xs"} />
                      <AnimatePresence>
                        {copiedField === row.label && (
                          <motion.span
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute -top-7 right-0 text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded shadow z-20 whitespace-nowrap"
                          >
                            Copied!
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Links */}
          <div className="pt-2 grid grid-cols-2 gap-3">
            <a
              href={`https://solscan.io/tx/${tx.txHash}`}
              target="_blank"
              rel="noreferrer"
              className="py-3 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <i className="ri-external-link-line" />
              <span>Solscan</span>
            </a>

            <button
              type="button"
              onClick={() => handleCopy(window.location.href, 'share')}
              className="py-3 px-3 rounded-2xl bg-gradient-to-r from-purple-600 to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-transform hover:scale-[1.02] shadow-md shadow-purple-500/20"
            >
              <i className="ri-share-line" />
              <span>Share Receipt</span>
            </button>
          </div>
        </div>
      </PageTransition>
    </ConsumerLayout>
  );
}
