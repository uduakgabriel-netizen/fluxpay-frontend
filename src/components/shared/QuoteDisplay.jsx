import React from 'react';
import { motion } from 'framer-motion';
import { Clock, RefreshCw, AlertCircle } from 'lucide-react';
import Skeleton from './Skeleton';

export default function QuoteDisplay({
  rate = '',
  grossAmount = '',
  fee = '',
  networkFee = '₦12',
  netPayout = '',
  expiresIn = 30,
  isExpired = false,
  onRefresh,
  loading = false,
  cryptoAmount = '',
  tokenSymbol = '',
}) {
  if (loading) {
    return (
      <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-purple-500/20 space-y-3">
        <div className="flex justify-between">
          <Skeleton variant="text" width="90px" />
          <Skeleton variant="text" width="120px" />
        </div>
        <div className="flex justify-between">
          <Skeleton variant="text" width="70px" />
          <Skeleton variant="text" width="80px" />
        </div>
        <div className="flex justify-between">
          <Skeleton variant="text" width="80px" />
          <Skeleton variant="text" width="60px" />
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex justify-between">
          <Skeleton variant="text" width="100px" height="20px" />
          <Skeleton variant="text" width="140px" height="20px" />
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="p-5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
          <AlertCircle size={16} />
          <span>Quote expired</span>
        </div>
        <p className="text-xs text-amber-600 dark:text-amber-300">
          The guaranteed rate has expired. Refresh to get the latest live Solana market price.
        </p>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-colors"
          >
            <RefreshCw size={13} />
            <span>Refresh Quote</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-purple-500/20 shadow-md shadow-purple-500/5 space-y-3">
      {/* Header & Guaranteed Timer */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.04] text-xs">
        <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
          Price Breakdown
        </span>
        {expiresIn > 0 && (
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-mono">
            <Clock size={13} className="text-[#8B5CF6]" />
            <span>Guaranteed for {expiresIn}s</span>
          </div>
        )}
      </div>

      <div className="space-y-2 text-xs sm:text-sm">
        {cryptoAmount && tokenSymbol && (
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <span>You sell:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {cryptoAmount} {tokenSymbol}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span>Exchange Rate:</span>
          <span className="font-mono text-slate-800 dark:text-slate-200">{rate}</span>
        </div>

        {grossAmount && (
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <span>Gross Value:</span>
            <span className="font-mono text-slate-800 dark:text-slate-200">{grossAmount}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
          <span>FluxPay fee (1%):</span>
          <span className="font-mono">{fee}</span>
        </div>

        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
          <span>Network fee:</span>
          <span className="font-mono">{networkFee}</span>
        </div>

        {/* Net Payout Total */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-sm sm:text-base font-bold">
          <span className="text-slate-900 dark:text-white">You Receive:</span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold text-base sm:text-lg">
            {netPayout}
          </span>
        </div>
      </div>
    </div>
  );
}
