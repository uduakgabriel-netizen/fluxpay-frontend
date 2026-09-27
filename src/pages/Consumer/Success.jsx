import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useConsumer } from '@/contexts/ConsumerContext';
import ConsumerLayout from '@/components/Consumer/ConsumerLayout';
import NumberCounter from '@/components/Consumer/NumberCounter';
import Confetti from '@/components/Consumer/Confetti';
import PageTransition from '@/components/shared/PageTransition';
import { useToast } from '@/components/shared/Toast';

export default function Success() {
  const router = useRouter();
  const { sellState, netFiat } = useConsumer();
  const toast = useToast();
  const txId = router.query.txId || sellState?.lastTxId || 'FP-8X294B91';

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(txId);
    setCopied(true);
    toast.info('Transaction ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ConsumerLayout title="Payment Complete" hideNav maxWidth="max-w-md">
      <PageTransition className="relative space-y-4">
        {/* Subtle Confetti Burst */}
        <Confetti />

        <div className="rounded-3xl bg-white dark:bg-slate-850 p-6 sm:p-8 text-center space-y-5 border border-slate-200/90 dark:border-slate-800 shadow-2xl relative overflow-hidden">
          {/* Big Checkmark */}
          <div className="flex justify-center relative z-10 pt-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 to-teal-400 p-0.5 shadow-xl shadow-teal-500/25 flex items-center justify-center text-white"
            >
              <div className="w-full h-full rounded-[22px] bg-white dark:bg-slate-900 flex items-center justify-center">
                <svg className="w-10 h-10 text-teal-500" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 13L9 17L19 7"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-checkmark-draw"
                  />
                </svg>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-1 relative z-10"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Transaction Successful
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Payment Complete</h2>
          </motion.div>

          {/* Amount Count Up */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="py-1"
          >
            <div className="text-4xl sm:text-5xl font-black text-purple-600 dark:text-teal-400 tracking-tight font-mono">
              <NumberCounter
                value={netFiat || 15230}
                prefix={sellState?.fiatSymbol || '₦'}
                duration={1.2}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Sent to {sellState?.payoutDetails?.provider || 'OPay'} {sellState?.payoutDetails?.accountNumber || '080XXXXXXXX'}
            </p>
          </motion.div>

          {/* Transaction ID Pill */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
          >
            <span className="text-slate-400">Transaction ID:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-900 dark:text-white">{txId}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="relative p-1 text-purple-600 dark:text-teal-400 hover:scale-110 transition-transform cursor-pointer"
                title="Copy ID"
              >
                <i className={copied ? "ri-check-line text-emerald-500 font-bold" : "ri-file-copy-line text-sm"} />
              </button>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="grid grid-cols-2 gap-3 pt-2"
          >
            <Link
              href={`/sell/transaction/${txId}`}
              className="py-3.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
            >
              <i className="ri-file-list-line text-base" />
              <span>Receipt</span>
            </Link>

            <Link
              href="/sell/home"
              className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-teal-500 text-white text-xs font-bold shadow-lg shadow-purple-500/25 transition-all text-center flex items-center justify-center gap-1.5"
            >
              <span>Done</span>
              <i className="ri-arrow-right-line text-base" />
            </Link>
          </motion.div>
        </div>
      </PageTransition>
    </ConsumerLayout>
  );
}
