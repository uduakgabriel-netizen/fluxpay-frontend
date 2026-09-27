import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function SettlementStatusBadge({ status, className = '' }) {
  const norm = (status || '').toLowerCase();

  if (norm === 'completed' || norm === 'success') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shadow-xs ${className}`}
      >
        <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
        <span>Completed</span>
      </span>
    );
  }

  if (norm === 'processing' || norm === 'pending') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 shadow-xs ${className}`}
      >
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
        <span>{norm === 'processing' ? 'Processing' : 'Pending'}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 shadow-xs ${className}`}
    >
      <AlertCircle size={13} className="text-rose-500 shrink-0" />
      <span>Failed</span>
    </span>
  );
}
