import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Building2, CheckCircle2 } from 'lucide-react';
import Skeleton from './Skeleton';

export default function ConfirmPreview({
  cryptoAmount = '0',
  tokenSymbol = '',
  fiatAmount = '₦0',
  rate = '',
  bankName = '',
  accountNumber = '',
  recipientName = '',
  fee = '₦0',
  networkFee = '₦0',
  onConfirm,
  loading = false,
  confirmButtonText = 'Confirm & Transfer',
}) {
  if (loading) {
    return (
      <div className="space-y-4 p-6 rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-purple-500/20">
        <Skeleton variant="text" width="50%" />
        <Skeleton variant="rectangular" height="80px" />
        <Skeleton variant="rectangular" height="120px" />
        <Skeleton variant="rectangular" height="50px" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Swap Visual Card */}
      <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-purple-500/20 shadow-lg shadow-purple-500/5 text-center space-y-3">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
          You are exchanging
        </span>

        <div className="flex items-center justify-center gap-3">
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white block">
              {cryptoAmount} {tokenSymbol}
            </span>
            <span className="text-xs text-slate-400">Solana Network</span>
          </div>

          <div className="w-9 h-9 rounded-2xl bg-purple-500/10 text-[#8B5CF6] flex items-center justify-center shrink-0">
            <ArrowRight size={18} />
          </div>

          <div className="text-left">
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 block">
              {fiatAmount}
            </span>
            <span className="text-xs text-slate-400">Direct Bank Payout</span>
          </div>
        </div>
      </div>

      {/* Details Box */}
      <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-purple-500/20 text-xs sm:text-sm space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.04]">
          <span className="text-slate-500 dark:text-slate-400">Destination:</span>
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
            <Building2 size={14} className="text-[#8B5CF6]" />
            <span>{bankName} · {accountNumber}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">Account Name:</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{recipientName}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">Guaranteed Rate:</span>
          <span className="font-mono text-slate-800 dark:text-slate-200">{rate}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">Processing Fee:</span>
          <span className="font-mono text-slate-800 dark:text-slate-200">{fee}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">Network Fee:</span>
          <span className="font-mono text-slate-800 dark:text-slate-200">{networkFee}</span>
        </div>
      </div>

      {/* CTA Button */}
      {onConfirm && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onConfirm}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white font-bold text-sm shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <ShieldCheck size={18} />
          <span>{confirmButtonText}</span>
        </motion.button>
      )}

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
        <ShieldCheck size={13} className="text-emerald-500" />
        <span>Non-custodial transfer secured by Solana cryptographic signature.</span>
      </div>
    </div>
  );
}
