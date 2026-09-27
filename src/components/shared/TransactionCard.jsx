import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Building2, ChevronRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import TokenIcon from '@/components/Consumer/TokenIcon';

export default function TransactionCard({
  tx,
  onClick,
  className = '',
}) {
  if (!tx) return null;

  const isCompleted = tx.status?.toLowerCase().includes('complete');
  const isProcessing = tx.status?.toLowerCase().includes('process');

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onClick && onClick(tx)}
      className={`p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/40 shadow-sm transition-all cursor-pointer flex items-center justify-between gap-3 ${className}`}
    >
      {/* Left side: Icon + Token & Bank info */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="relative shrink-0">
          <TokenIcon symbol={tx.token || 'SOL'} size="sm" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[9px] shadow">
            <ArrowUpRight size={10} />
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
              Sold {tx.tokenAmount || '1.5'} {tx.token || 'SOL'}
            </p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5 flex items-center gap-1">
            <Building2 size={12} className="shrink-0 text-gray-400" />
            <span>{tx.destination || tx.method || 'Bank Account'}</span>
          </p>
        </div>
      </div>

      {/* Right side: Fiat Amount + Status Badge + Date */}
      <div className="text-right shrink-0 flex items-center gap-3">
        <div>
          <p className="font-black text-sm text-emerald-600 dark:text-teal-400 font-mono">
            +{tx.currency === 'USD' ? '$' : tx.currency === 'EUR' ? '€' : '₦'}{tx.fiatAmount}
          </p>
          <div className="mt-1 flex items-center justify-end gap-1.5">
            <StatusBadge status={tx.status} size="sm" />
            <span className="text-[10px] text-gray-400 dark:text-gray-500 hidden sm:inline">
              {tx.date || 'Today'}
            </span>
          </div>
        </div>

        <ChevronRight size={16} className="text-gray-400 hidden sm:block" />
      </div>
    </motion.div>
  );
}
