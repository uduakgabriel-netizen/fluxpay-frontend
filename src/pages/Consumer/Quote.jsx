import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useConsumer } from '@/contexts/ConsumerContext';
import ConsumerLayout from '@/components/Consumer/ConsumerLayout';
import TokenIcon from '@/components/Consumer/TokenIcon';
import Skeleton from '@/components/shared/Skeleton';
import ErrorCard from '@/components/shared/ErrorCard';
import PageTransition from '@/components/shared/PageTransition';
import { useToast } from '@/components/shared/Toast';

export default function Quote() {
  const router = useRouter();
  const { sellState, numericAmount, fee, netFiat, generateQuote, activeQuote } = useConsumer();
  const toast = useToast();

  const [timeLeft, setTimeLeft] = useState(30);
  const [isExpired, setIsExpired] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    generateQuote?.().catch((err) => {
      console.warn('Quote fetch failed:', err);
    });
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!isExpired) {
        setIsExpired(true);
        toast.warning('Quote expired. Refresh to get a new rate.');
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsExpired(true);
          toast.warning('Quote expired. Refresh to get a new rate.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isExpired, toast]);

  const handleRefreshQuote = async () => {
    setIsRefreshing(true);
    try {
      await generateQuote?.();
      setTimeLeft(30);
      setIsExpired(false);
      toast.info('New rate guaranteed for 30s');
    } catch (err) {
      toast.error(err?.message || 'Failed to refresh quote');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleContinue = () => {
    if (!isExpired) {
      router.push('/sell/payout');
    }
  };

  const progressPercent = (timeLeft / 30) * 100;
  const formattedSeconds = String(timeLeft).padStart(2, '0');

  return (
    <ConsumerLayout title="Confirm Quote" backHref="/sell/sell" maxWidth="max-w-md">
      <PageTransition className="space-y-4">
        {/* Quote Card */}
        <div
          className={`rounded-3xl bg-white dark:bg-slate-850 p-6 sm:p-7 space-y-6 border shadow-xl shadow-purple-500/5 transition-all duration-300 ${
            isExpired
              ? 'border-rose-300 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20'
              : 'border-slate-200/90 dark:border-slate-800'
          }`}
        >
          {/* Send Section */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                You send
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                {numericAmount.toLocaleString()} {sellState.token.symbol}
              </div>
            </div>
            <TokenIcon symbol={sellState.token.symbol} size="lg" />
          </div>

          {/* Receive Section */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                You receive
              </span>
              <div className="text-3xl font-black text-purple-600 dark:text-teal-400 mt-1 font-mono">
                {sellState.fiatSymbol}{netFiat.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Direct to your local payout account
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-300 text-xl font-bold">
              {sellState.fiatSymbol}
            </div>
          </div>

          {/* Rate and Fees */}
          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            {isRefreshing ? (
              <div className="space-y-2 py-1">
                <Skeleton height="14px" width="70%" />
                <Skeleton height="14px" width="55%" />
                <Skeleton height="14px" width="40%" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span>Rate:</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    1 {sellState.token.symbol} = {sellState.fiatSymbol}{sellState.token.rateNgn.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>FluxPay Fee:</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {sellState.fiatSymbol}{fee.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Network fee:</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    ~{sellState.fiatSymbol}12
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Countdown Timer & Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              {isExpired ? (
                <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5">
                  <i className="ri-error-warning-fill" />
                  Quote expired
                </span>
              ) : (
                <span className="text-slate-500 dark:text-slate-400">
                  Quote expires in:{' '}
                  <span className="font-mono font-bold text-slate-900 dark:text-white">00:{formattedSeconds}</span>
                </span>
              )}

              {isExpired && (
                <button
                  type="button"
                  onClick={handleRefreshQuote}
                  disabled={isRefreshing}
                  className="text-purple-600 dark:text-teal-400 hover:underline font-semibold text-xs flex items-center gap-1"
                >
                  <i className={`ri-refresh-line ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh quote
                </button>
              )}
            </div>

            {/* Visual Draining Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
              <motion.div
                initial={false}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'linear' }}
                className={`h-full rounded-full transition-colors ${
                  isExpired
                    ? 'bg-rose-500'
                    : progressPercent < 30
                    ? 'bg-amber-400'
                    : 'bg-gradient-to-r from-purple-600 to-teal-500'
                }`}
              />
            </div>
          </div>

          {/* Error card when expired */}
          <AnimatePresence>
            {isExpired && (
              <ErrorCard
                type="expired"
                onRetry={handleRefreshQuote}
                actionLabel="Refresh Rate Now"
              />
            )}
          </AnimatePresence>

          {/* Action Button */}
          {isExpired ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRefreshQuote}
              className="w-full py-4 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
            >
              <i className="ri-refresh-line" />
              <span>Refresh Quote</span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleContinue}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-500 hover:to-teal-400 text-white font-bold text-base shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>CONTINUE</span>
              <i className="ri-arrow-right-line" />
            </motion.button>
          )}
        </div>
      </PageTransition>
    </ConsumerLayout>
  );
}
