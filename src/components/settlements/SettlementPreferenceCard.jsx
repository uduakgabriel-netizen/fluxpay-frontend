import React from 'react';
import { motion } from 'framer-motion';
import { Coins, Landmark } from 'lucide-react';

export default function SettlementPreferenceCard({
  type,
  title,
  description,
  selected,
  onSelect,
}) {
  const isCrypto = type === 'CRYPTO';

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect(type)}
      className={`w-full text-left p-5 sm:p-6 rounded-2xl transition-all relative overflow-hidden flex items-start gap-4 border ${
        selected
          ? 'bg-gradient-to-r from-purple-500/10 via-purple-600/5 to-transparent border-[#8B5CF6] shadow-lg shadow-purple-500/10 dark:bg-purple-950/20'
          : 'bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border-slate-200/80 dark:border-white/[0.08] hover:border-[#8B5CF6]/50 shadow-sm'
      }`}
    >
      {/* Radio Circle */}
      <div className="pt-0.5 shrink-0">
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
            selected
              ? 'border-2 border-[#8B5CF6] bg-[#8B5CF6]'
              : 'border-2 border-slate-300 dark:border-slate-600 bg-transparent'
          }`}
        >
          {selected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </span>
          {selected && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30">
              Active
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Icon decoration */}
      <div
        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
          selected
            ? 'bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] text-white shadow-md shadow-purple-500/25'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
        }`}
      >
        {isCrypto ? <Coins size={20} /> : <Landmark size={20} />}
      </div>
    </motion.button>
  );
}
