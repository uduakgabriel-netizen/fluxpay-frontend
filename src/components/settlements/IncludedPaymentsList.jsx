import React from 'react';
import { FileText, ArrowRight } from 'lucide-react';

export default function IncludedPaymentsList({ payments = [] }) {
  if (!payments || payments.length === 0) {
    return (
      <div className="py-4 text-center text-xs text-slate-400">
        No payment records found for this batch.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-white/[0.04] overflow-hidden">
      {payments.map((payment) => (
        <div
          key={payment.id}
          className="py-3 sm:py-3.5 flex items-center justify-between gap-3 text-xs sm:text-sm hover:bg-slate-50/50 dark:hover:bg-white/[0.02] px-1 rounded-xl transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-[#8B5CF6] flex items-center justify-center shrink-0">
              <FileText size={14} />
            </div>
            <div>
              <span className="font-mono font-bold text-slate-900 dark:text-white block">
                {payment.id}
              </span>
              {payment.date && (
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {payment.date}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-right">
            <span className="font-mono text-slate-500 dark:text-slate-400 text-xs">
              {payment.cryptoAmount}
            </span>
            <ArrowRight size={12} className="text-slate-300 dark:text-slate-600 hidden sm:inline" />
            <span className="font-mono font-bold text-[#8B5CF6] text-xs sm:text-sm">
              {payment.fiatAmount}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
