import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Building2 } from 'lucide-react';
import SettlementStatusBadge from './SettlementStatusBadge';

export default function SettlementRow({ settlement }) {
  if (!settlement) return null;

  return (
    <Link href={`/dashboard/settlements/${settlement.id}`}>
      <motion.div
        whileHover={{ y: -2, scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-purple-500/20 shadow-md shadow-purple-500/5 hover:border-[#8B5CF6]/50 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        {/* Left Section: Date & Amounts */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              {settlement.date}
            </span>
            <span className="text-[11px] font-mono text-slate-400">·</span>
            <span className="text-xs font-mono text-purple-600 dark:text-[#8B5CF6]">
              {settlement.id}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 font-mono">
              {settlement.cryptoReceived}
            </span>
            <ArrowRight size={14} className="text-slate-400" />
            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono">
              {settlement.fiatAmount}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Building2 size={13} className="text-[#8B5CF6] shrink-0" />
            <span className="truncate max-w-xs sm:max-w-md">
              {settlement.destinationAccount} · {settlement.recipientName}
            </span>
          </div>
        </div>

        {/* Right Section: Status Badge & Chevron */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/[0.04]">
          <SettlementStatusBadge status={settlement.status} />

          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-purple-600 dark:group-hover:text-[#8B5CF6] group-hover:translate-x-0.5 transition-all">
            <ChevronRight size={16} />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
