import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Building2, Trash2, Edit3, Star } from 'lucide-react';

export default function BankAccountCard({
  account,
  onSetDefault,
  onEdit,
  onRemove,
  compact = false,
  selected = false,
  onSelect,
}) {
  if (!account) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -1 }}
      onClick={onSelect ? () => onSelect(account) : undefined}
      className={`relative rounded-2xl p-5 transition-all overflow-hidden ${
        onSelect ? 'cursor-pointer' : ''
      } ${
        selected
          ? 'bg-gradient-to-r from-purple-500/10 via-purple-600/5 to-transparent border-2 border-[#8B5CF6] shadow-lg shadow-purple-500/10'
          : 'bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-purple-500/20 shadow-md shadow-purple-500/5 hover:border-[#8B5CF6]/50'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] shrink-0">
            <Building2 size={20} />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              {account.bankName}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              {account.accountNumber}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 shrink-0">
          {account.isDefault && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30">
              <Star size={11} className="fill-[#8B5CF6]" />
              Default
            </span>
          )}
          {account.isVerified && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 size={11} />
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Account Name */}
      <div className="mb-4 pl-1">
        <p className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold mb-0.5">
          Account Name
        </p>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 tracking-wide">
          {account.accountName}
        </p>
      </div>

      {/* Actions (if not compact mode) */}
      {!compact && (
        <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            {!account.isDefault && onSetDefault && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSetDefault(account.id);
                }}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-[#8B5CF6] border border-[#8B5CF6]/30 transition-colors"
              >
                Set Default
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(account);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <Edit3 size={13} />
                <span>Edit</span>
              </button>
            )}

            {onRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(account.id);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/50 transition-colors"
              >
                <Trash2 size={13} />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
