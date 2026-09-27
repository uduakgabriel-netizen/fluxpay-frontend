import React from 'react';
import Skeleton from './Skeleton';

export default function AmountInput({
  value = '',
  onChange,
  onMax,
  tokenSymbol = 'SOL',
  maxBalance = null,
  fiatEquivalent = null,
  loading = false,
  error = null,
  label = 'Amount',
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton variant="text" width="60px" height="12px" />
        <Skeleton variant="rectangular" height="52px" className="rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[11px]">
          {label}
        </span>
        {maxBalance !== null && onMax && (
          <button
            type="button"
            onClick={onMax}
            className="font-bold text-xs text-[#8B5CF6] hover:underline flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-purple-500 rounded"
          >
            <span>MAX:</span>
            <span className="font-mono">{maxBalance} {tokenSymbol}</span>
          </button>
        )}
      </div>

      <div
        className={`relative flex items-center rounded-2xl bg-white dark:bg-slate-800/90 border transition-all ${
          error
            ? 'border-rose-400 focus-within:border-rose-500'
            : 'border-slate-200 dark:border-white/[0.08] focus-within:border-[#8B5CF6] focus-within:ring-2 focus-within:ring-purple-500/20'
        }`}
      >
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9.]/g, '');
            if (onChange) onChange(val);
          }}
          placeholder="0.00"
          className="w-full pl-4 pr-16 py-3 bg-transparent text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none"
        />

        <div className="absolute right-3.5 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/60 text-xs font-bold text-slate-700 dark:text-slate-200 font-mono pointer-events-none">
          {tokenSymbol}
        </div>
      </div>

      {/* Fiat Equivalent & Error */}
      <div className="flex items-center justify-between text-xs px-1">
        {fiatEquivalent ? (
          <span className="text-slate-400 font-mono text-[11px]">
            ≈ {fiatEquivalent}
          </span>
        ) : <span />}

        {error && (
          <span className="text-rose-500 font-semibold text-[11px]">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
