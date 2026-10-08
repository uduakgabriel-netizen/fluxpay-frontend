import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useConsumer } from '@/contexts/ConsumerContext';
import ConsumerLayout from '@/components/Consumer/ConsumerLayout';
import TokenIcon from '@/components/Consumer/TokenIcon';
import NumberCounter from '@/components/Consumer/NumberCounter';
import SparklineChart from '@/components/Consumer/SparklineChart';
import Skeleton, { CardSkeleton, RowSkeleton } from '@/components/shared/Skeleton';
import EmptyState from '@/components/shared/EmptyState';
import PageTransition from '@/components/shared/PageTransition';

export default function Home() {
  const router = useRouter();
  const { wallet, tokens, sellState, selectToken } = useConsumer();
  const [loading, setLoading] = useState(true);
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const [activeAsset, setActiveAsset] = useState(tokens[0] || null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (tokens && tokens.length > 0 && !activeAsset) {
      setActiveAsset(tokens[0]);
    }
  }, [tokens, activeAsset]);

  const handleSellToken = (symbol) => {
    selectToken(symbol);
    router.push('/sell/sell');
  };

  return (
    <ConsumerLayout title="My Portfolio" maxWidth="max-w-md">
      <PageTransition className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            <Skeleton height="56px" className="rounded-2xl" />
            <CardSkeleton rows={2} />
            <RowSkeleton count={4} />
          </div>
        ) : (
          <>
            {/* Currency / Token Selector at Top (Matching Image 2 Screen 1) */}
            {activeAsset && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTokenDropdown(!showTokenDropdown)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 shadow-sm hover:border-purple-400 dark:hover:border-teal-400 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <TokenIcon symbol={activeAsset.symbol} size="sm" />
                    <div>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium block">
                        Select Currency
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-teal-400 transition-colors">
                        {activeAsset.name} ({activeAsset.symbol})
                      </span>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center text-slate-500 dark:text-slate-300">
                    <i className={`ri-arrow-down-s-line text-lg transition-transform ${showTokenDropdown ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Currency Dropdown Menu */}
                <AnimatePresence>
                  {showTokenDropdown && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-white dark:bg-slate-900 p-2 shadow-2xl z-50 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800"
                    >
                      {tokens.map((t) => (
                        <button
                          key={t.symbol}
                          type="button"
                          onClick={() => {
                            setActiveAsset(t);
                            selectToken(t.symbol);
                            setShowTokenDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                            activeAsset.symbol === t.symbol
                              ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-teal-300 font-bold'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <TokenIcon symbol={t.symbol} size="sm" />
                            <span className="text-sm font-semibold">{t.name}</span>
                          </div>
                          <span className="text-xs font-mono">{t.balance} {t.symbol}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Portfolio Value & Sparkline Chart Card */}
            <div className="rounded-3xl bg-white dark:bg-slate-850 p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-purple-500/5 relative overflow-hidden space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                    Total Portfolio Value
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1 font-mono">
                    <NumberCounter
                      value={wallet?.balanceNgn || 0}
                      prefix="₦"
                      duration={1.2}
                      decimals={0}
                    />
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <i className="ri-arrow-up-line" />
                  +4.25%
                </span>
              </div>

              {/* Interactive Chart with Timeframes */}
              <SparklineChart timeframe="1M" />

              {/* Action Buttons: [ BUY ] and [ SELL ] */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => activeAsset && handleSellToken(activeAsset.symbol)}
                  className="py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 active:scale-95"
                >
                  <i className="ri-download-line text-purple-600 dark:text-teal-400" />
                  <span>BUY</span>
                </button>

                <Link
                  href="/sell/sell"
                  className="py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <i className="ri-upload-line" />
                  <span>SELL</span>
                </Link>
              </div>
            </div>

            {/* Your Assets List */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Your Assets
                </h2>
                <span className="text-xs text-slate-400">
                  {tokens.length} Solana tokens
                </span>
              </div>

              {tokens.length === 0 ? (
                <EmptyState type="assets" />
              ) : (
                <div className="rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                  {tokens.slice(0, 5).map((token) => {
                    const totalVal = Math.round(token.balance * token.rateNgn);
                    return (
                      <motion.div
                        key={token.symbol}
                        whileHover={{ backgroundColor: 'rgba(124, 58, 237, 0.04)' }}
                        onClick={() => handleSellToken(token.symbol)}
                        className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <TokenIcon symbol={token.symbol} size="md" className="group-hover:scale-105 transition-transform" />
                          <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-teal-400 transition-colors">
                              {token.name} Wallet
                            </div>
                            <div className="text-xs text-slate-400">
                              Using Solana non-custodial
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                            +{token.balance} {token.symbol}
                          </div>
                          <div className="text-xs text-purple-600 dark:text-teal-400 font-semibold font-mono">
                            ≈ ₦{totalVal.toLocaleString()}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </PageTransition>
    </ConsumerLayout>
  );
}
