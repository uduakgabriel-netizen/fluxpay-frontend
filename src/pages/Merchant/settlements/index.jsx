import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ArrowUpRight, SlidersHorizontal } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/layout';
import PageTransition from '@/components/shared/PageTransition';
import SettlementSummaryCards from '@/components/settlements/SettlementSummaryCards';
import SettlementRow from '@/components/settlements/SettlementRow';
import Skeleton, { RowSkeleton } from '@/components/shared/Skeleton';
import EmptyState from '@/components/shared/EmptyState';
import { useMerchantSettlement } from '@/contexts/MerchantSettlementContext';

const TABS = ['All', 'Pending', 'Completed', 'Failed'];

export default function SettlementsDashboardPage() {
  const { settlements, summary } = useMerchantSettlement();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(timer);
  }, []);

  const filteredSettlements = useMemo(() => {
    return settlements.filter((s) => {
      // Tab filter
      if (activeTab === 'Pending') {
        if (s.status !== 'Pending' && s.status !== 'Processing') return false;
      } else if (activeTab !== 'All' && s.status !== activeTab) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesToken = s.cryptoReceived.toLowerCase().includes(query);
        const matchesAccount = s.destinationAccount.toLowerCase().includes(query);
        const matchesId = s.id.toLowerCase().includes(query);
        const matchesName = s.recipientName.toLowerCase().includes(query);
        const matchesFiat = s.fiatAmount.toLowerCase().includes(query);
        if (!matchesToken && !matchesAccount && !matchesId && !matchesName && !matchesFiat) {
          return false;
        }
      }

      return true;
    });
  }, [settlements, activeTab, searchQuery]);

  const counts = useMemo(() => {
    return {
      All: settlements.length,
      Pending: settlements.filter((s) => s.status === 'Pending' || s.status === 'Processing').length,
      Completed: settlements.filter((s) => s.status === 'Completed').length,
      Failed: settlements.filter((s) => s.status === 'Failed').length,
    };
  }, [settlements]);

  return (
    <DashboardLayout pageTitle="Settlements">
      <PageTransition className="space-y-6 max-w-5xl">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Settlements
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Automated fiat conversions and direct bank account payouts
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard/settings/settlement"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-xs font-bold text-[#8B5CF6] border border-[#8B5CF6]/30 transition-all shadow-sm"
            >
              <SlidersHorizontal size={14} />
              <span>Settlement Settings</span>
            </Link>
          </div>
        </div>

        {/* Summary Metric Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-3">
                <Skeleton variant="text" width="60px" />
                <Skeleton variant="text" width="140px" height="28px" />
                <Skeleton variant="text" width="100px" height="10px" />
              </div>
            ))}
          </div>
        ) : (
          <SettlementSummaryCards
            pending={summary.pendingAmount}
            thisMonth={summary.thisMonthAmount}
            total={summary.totalAmount}
          />
        )}

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/[0.06] overflow-x-auto scrollbar-none">
            {TABS.map((tab) => {
              const count = counts[tab];
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/40 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white shadow-md shadow-purple-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{tab}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search token, account, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/[0.08] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-purple-500/20 transition-colors shadow-xs"
            />
          </div>
        </div>

        {/* Settlements List */}
        <div className="space-y-3">
          {loading ? (
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-3">
              <RowSkeleton count={5} />
            </div>
          ) : filteredSettlements.length === 0 ? (
            searchQuery ? (
              <EmptyState
                type="default"
                title="No results found"
                description={`No settlements matching "${searchQuery}".`}
                actionLabel="Clear Search"
                onAction={() => setSearchQuery('')}
              />
            ) : (
              <EmptyState
                type="transactions"
                title="No settlements yet"
                description="Your settlement history will appear here once customer payments are batched."
                actionLabel="Back to Dashboard"
                actionHref="/dashboard"
              />
            )
          ) : (
            <AnimatePresence>
              {filteredSettlements.map((settlement) => (
                <SettlementRow key={settlement.id} settlement={settlement} />
              ))}
            </AnimatePresence>
          )}
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
