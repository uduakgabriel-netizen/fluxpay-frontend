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

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    import('@/services/api/transactionsApi').then(({ transactionsApi }) => {
      transactionsApi.getById(id).then((t) => {
        if (!t) return;
        setDetailTx({
          id: t.id,
          token: t.sourceToken,
          tokenAmount: t.sourceAmount,
          fiatAmount: t.netAmount || t.fiatAmount,
          currency: t.fiatCurrency || 'NGN',
          method: t.provider || 'Bank Transfer',
          destination: t.bankAccount ? `${t.bankAccount.bankName} ${t.bankAccount.accountNumber}` : 'Local Account',
          recipient: t.bankAccount ? t.bankAccount.accountName : 'Verified Account',
          status: t.status === 'COMPLETED' ? 'Completed' : t.status === 'FAILED' ? 'Failed' : 'Processing',
          txHash: t.swapTxHash || '',
          payoutRef: t.payoutRefId || '',
          date: t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent',
          rate: `1 ${t.sourceToken} = ₦${t.rate}`,
          fee: `₦${t.fee}`,
          networkFee: `₦${t.networkFee || '12'}`,
        });
      }).catch((err) => {
        console.warn('Could not fetch detailTx from API:', err);
      });
    });
  }, [id]);

  const tx = detailTx || transactions.find((t) => t.id === id) || {
    id: id || 'FP-TX',
    token: 'BONK',
    tokenAmount: '10,000',
    fiatAmount: '15,230',
    currency: 'NGN',
    method: 'OPay',
    destination: 'OPay Account',
    recipient: 'UDUAK GABRIEL AKPAN',
    status: 'Completed',
    txHash: '5K8a...9xLP',
    payoutRef: 'BR-882390141',
    date: 'Recent',
    rate: '1 BONK = ₦1.523',
    fee: '₦152',
    networkFee: '₦12',
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`Copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const rows = [
    { label: 'Source Asset :', value: tx.token },
    { label: 'Payout Destination :', value: tx.destination },
    { label: 'Exchange Rate :', value: tx.rate || `1 ${tx.token} = ₦1.523` },
    { label: 'FluxPay Fee :', value: tx.fee || '₦152' },
    { label: 'Network Fee :', value: tx.networkFee || '₦12' },
    { label: 'Blockchain Network :', value: 'Solana' },
    {
      label: 'Transaction Hash :',
      value: tx.txHash,
      canCopy: true,
      shortValue: `${tx.txHash.slice(0, 8)}...${tx.txHash.slice(-6)}`
    },
    {
      label: 'Payout Reference :',
      value: tx.payoutRef,
      canCopy: true
    },
    { label: 'Created Time :', value: tx.date || '24 Sep 2026' },
    { label: 'Settlement Status :', value: tx.status || 'Completed' },
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
