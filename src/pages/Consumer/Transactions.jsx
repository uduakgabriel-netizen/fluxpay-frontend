import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useConsumer } from '@/contexts/ConsumerContext';
import ConsumerLayout from '@/components/Consumer/ConsumerLayout';
import TokenIcon from '@/components/Consumer/TokenIcon';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import { RowSkeleton } from '@/components/shared/Skeleton';
import PageTransition from '@/components/shared/PageTransition';

export default function Transactions() {
  const router = useRouter();
  const { transactions } = useConsumer();
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const filterTabs = ['All', 'Completed', 'Processing', 'Failed'];

  const filtered = (transactions || []).filter((t) => {
    if (filter === 'All') return true;
    return t.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <ConsumerLayout title="Activity" maxWidth="max-w-md">
      <PageTransition className="space-y-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-sm relative overflow-x-auto">
          {filterTabs.map((tab) => {
            const isSelected = filter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all relative z-10 text-center whitespace-nowrap ${
                  isSelected
                    ? 'text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="tx-tab-underline"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-teal-500 shadow-md shadow-purple-500/20 -z-10"
                  />
                )}
                <span>{tab}</span>
              </button>
            );
          })}
        </div>

        {/* Transactions List Card */}
        {loading ? (
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-purple-500/5">
            <RowSkeleton count={5} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            type="transactions"
            title={filter === 'All' ? 'No transactions yet' : `No ${filter.toLowerCase()} transactions`}
            description={filter === 'All' ? 'Sell your first crypto to see your activity history here.' : `You have no ${filter.toLowerCase()} transactions currently.`}
            actionLabel="Start a Swap"
            actionHref="/sell/sell"
          />
        ) : (
          <div className="rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-purple-500/5 overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ backgroundColor: 'rgba(124, 58, 237, 0.04)' }}
                  onClick={() => router.push(`/sell/transaction/${item.id}`)}
                  className="p-4 flex items-center justify-between cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <TokenIcon symbol={item.token} size="md" className="group-hover:scale-105 transition-transform" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-teal-400 transition-colors">
                          {item.tokenAmount} {item.token}
                        </span>
                        <i className="ri-arrow-right-line text-xs text-slate-400" />
                        <span className="text-sm font-bold text-purple-600 dark:text-teal-400 font-mono">
                          ₦{item.fiatAmount}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>{item.method}</span>
                        <span>•</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <StatusBadge status={item.status} size="sm" />
                    <i className="ri-arrow-right-s-line text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </PageTransition>
    </ConsumerLayout>
  );
}
