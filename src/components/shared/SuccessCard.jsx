import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, ExternalLink, Download, Building2 } from 'lucide-react';

export default function SuccessCard({
  fiatAmount = '',
  cryptoAmount = '',
  destination = '',
  recipientName = '',
  reference = '',
  txHash = null,
  onDone,
  onDownloadReceipt,
  doneButtonLabel = 'Done',
}) {
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-purple-500/20 shadow-2xl shadow-purple-500/10 text-center space-y-5 max-w-md mx-auto">
      {/* Animated Success Badge */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20"
      >
        <CheckCircle2 size={36} />
      </motion.div>

      <div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Payment Settled!
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Funds have been transferred directly to your bank account.
        </p>
      </div>

      {/* Amount Banner */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/[0.06] space-y-1">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
          Amount Sent
        </span>
        <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
          {fiatAmount}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Swapped from {cryptoAmount}
        </div>
      </div>

      {/* Details Box */}
      <div className="p-3.5 rounded-xl bg-slate-50/50 dark:bg-slate-850 border border-slate-100 dark:border-white/[0.04] text-xs space-y-2 text-left">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Recipient:</span>
          <span className="font-semibold text-slate-900 dark:text-white">{recipientName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Destination:</span>
          <span className="font-mono text-slate-800 dark:text-slate-200">{destination}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Reference:</span>
          <span className="font-mono text-purple-600 dark:text-[#8B5CF6] font-bold">{reference}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-2">
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-500/25 transition-all cursor-pointer"
          >
            {doneButtonLabel}
          </button>
        )}

        {onDownloadReceipt && (
          <button
            type="button"
            onClick={onDownloadReceipt}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download size={14} />
            <span>Download Receipt</span>
          </button>
        )}
      </div>
    </div>
  );
}
