import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Coins } from 'lucide-react';
import Skeleton from './Skeleton';

export default function TokenSelector({
  tokens = [],
  selectedToken = null,
  onSelect,
  loading = false,
  variant = 'dropdown', // 'dropdown' | 'grid' | 'list'
  label = 'Select Token',
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton variant="text" width="80px" height="12px" />
        <Skeleton variant="rectangular" height="48px" className="rounded-xl" />
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {tokens.map((token) => {
          const isSelected = selectedToken?.symbol === token.symbol;
          return (
            <button
              key={token.symbol}
              type="button"
              onClick={() => onSelect && onSelect(token)}
              className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                isSelected
                  ? 'bg-purple-500/10 border-[#8B5CF6] text-purple-900 dark:text-purple-100 shadow-sm'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-white/[0.08] hover:border-[#8B5CF6]/40 text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center text-white text-xs font-bold shrink-0">
                {token.symbol.slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold block truncate">{token.symbol}</span>
                <span className="text-[10px] text-slate-400 block truncate">{token.name}</span>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative">
      {label && (
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-white/[0.08] hover:border-[#8B5CF6] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40"
      >
        {selectedToken ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {selectedToken.symbol?.slice(0, 2)}
            </div>
            <div className="text-left">
              <span className="text-sm font-bold text-slate-900 dark:text-white block leading-tight">
                {selectedToken.name} ({selectedToken.symbol})
              </span>
              {selectedToken.balance !== undefined && (
                <span className="text-[11px] font-mono text-slate-400">
                  Balance: {selectedToken.balance} {selectedToken.symbol}
                </span>
              )}
            </div>
          </div>
        ) : (
          <span className="text-xs text-slate-400 font-medium">Select a token...</span>
        )}

        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-purple-500/20 shadow-2xl p-2 max-h-60 overflow-y-auto space-y-1"
          >
            {tokens.map((token) => {
              const isSelected = selectedToken?.symbol === token.symbol;
              return (
                <button
                  key={token.symbol}
                  type="button"
                  onClick={() => {
                    if (onSelect) onSelect(token);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                    isSelected
                      ? 'bg-purple-50 dark:bg-purple-950/40 text-[#8B5CF6] font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                      {token.symbol?.slice(0, 2)}
                    </div>
                    <div>
                      <span className="text-xs font-bold block">{token.name}</span>
                      <span className="text-[10px] text-slate-400">{token.symbol}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    {token.balance !== undefined && (
                      <span className="text-xs font-mono font-semibold block">
                        {token.balance}
                      </span>
                    )}
                    {isSelected && <Check size={14} className="text-[#8B5CF6] ml-auto" />}
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
