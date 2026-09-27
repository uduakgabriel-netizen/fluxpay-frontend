import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useConsumer } from '@/contexts/ConsumerContext';
import ConsumerLayout from '@/components/Consumer/ConsumerLayout';
import TokenIcon from '@/components/Consumer/TokenIcon';
import Skeleton, { CardSkeleton, RowSkeleton } from '@/components/shared/Skeleton';
import EmptyState from '@/components/shared/EmptyState';
import PageTransition from '@/components/shared/PageTransition';
import { useToast } from '@/components/shared/Toast';

export default function Wallets() {
  const router = useRouter();
  const { wallet, tokens, disconnectWallet } = useConsumer();
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showAssets, setShowAssets] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      toast.info('Wallet address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast.warning('Wallet disconnected');
    router.push('/sell');
  };

  return (
    <ConsumerLayout title="Wallets" maxWidth="max-w-md">
      <PageTransition className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            <CardSkeleton rows={2} />
            <Skeleton height="48px" className="rounded-2xl" />
          </div>
        ) : !wallet?.connected ? (
          <EmptyState
            type="wallets"
            title="No wallet connected"
            description="Connect your Solana wallet (Phantom, Solflare) to view token balances and swap to fiat."
            actionLabel="Connect Wallet"
            actionHref="/sell"
          />
        ) : (
          <>
            {/* Primary Wallet Card */}
            <div className="rounded-3xl bg-white dark:bg-slate-850 p-6 sm:p-7 space-y-5 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-purple-500/5 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-teal-400">
                    <i className="ri-wallet-3-line text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Solana Wallet</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-xs text-purple-600 dark:text-teal-400 font-semibold">
                        {wallet.displayAddress}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="relative text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        title="Copy address"
                      >
                        <i className={copied ? "ri-check-line text-emerald-500 font-bold" : "ri-file-copy-line text-xs"} />
                      </button>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Connected ✓
                </span>
              </div>

              {/* Balance Info */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Liquid Value:</span>
                <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                  ₦{(wallet.balanceNgn || 1245320).toLocaleString()}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAssets(!showAssets)}
                  className="py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <i className="ri-coin-line text-sm" />
                  <span>{showAssets ? 'Hide Assets' : 'View Assets'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="py-3 px-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <i className="ri-logout-box-r-line text-sm" />
                  <span>Disconnect</span>
                </button>
              </div>

              {/* Expanded Holdings */}
              <AnimatePresence>
                {showAssets && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800"
                  >
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Token Balances:</div>
                    {tokens.length === 0 ? (
                      <EmptyState type="assets" />
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {tokens.map((t) => (
                          <div
                            key={t.symbol}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <TokenIcon symbol={t.symbol} size="sm" />
                              <span className="font-bold text-slate-900 dark:text-white">{t.symbol}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                                {t.balance} {t.symbol}
                              </span>
                              <span className="block text-[10px] text-purple-600 dark:text-teal-400 font-mono font-medium">
                                ≈ ₦{Math.round(t.balance * t.rateNgn).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Network status card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between text-xs shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-700 dark:text-slate-300 font-semibold">Solana Mainnet-Beta</span>
              </div>
              <span className="text-slate-400 font-mono">Ping: 34ms • TPS: 2,912</span>
            </div>
          </>
        )}
      </PageTransition>
    </ConsumerLayout>
  );
}
