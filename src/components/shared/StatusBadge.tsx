import React from 'react';
import { CheckCircle2, Clock, XCircle, RefreshCw, LucideIcon } from 'lucide-react';

export interface StatusBadgeProps {
  status?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export default function StatusBadge({
  status = 'Completed',
  size = 'sm',
  showIcon = true,
  className = '',
}: StatusBadgeProps) {
  const norm = (status || '').toLowerCase();

  let config: {
    bg: string;
    text: string;
    dot: string;
    icon: LucideIcon;
    label: string;
  } = {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
    label: 'Completed',
  };

  if (norm.includes('process') || norm.includes('pending') || norm.includes('wait')) {
    config = {
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
      text: 'text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-500 animate-pulse',
      icon: Clock,
      label: status || 'Pending',
    };
  } else if (norm.includes('fail') || norm.includes('cancel') || norm.includes('reject')) {
    config = {
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60',
      text: 'text-rose-700 dark:text-rose-300',
      dot: 'bg-rose-500',
      icon: XCircle,
      label: status || 'Failed',
    };
  } else if (norm.includes('refund')) {
    config = {
      bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60',
      text: 'text-blue-700 dark:text-blue-300',
      dot: 'bg-blue-500',
      icon: RefreshCw,
      label: 'Refunded',
    };
  } else if (norm.includes('settl')) {
    config = {
      bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60',
      text: 'text-purple-700 dark:text-purple-300',
      dot: 'bg-purple-500 animate-pulse',
      icon: Clock,
      label: 'Settling',
    };
  } else if (norm.includes('expire')) {
    config = {
      bg: 'bg-gray-100 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700/60',
      text: 'text-gray-600 dark:text-gray-400',
      dot: 'bg-gray-400',
      icon: XCircle,
      label: 'Expired',
    };
  } else if (norm.includes('confirm')) {
    config = {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
      text: 'text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500',
      icon: CheckCircle2,
      label: 'Confirmed',
    };
  }

  const IconComponent = config.icon;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border transition-colors ${
        isSm ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      } ${config.bg} ${config.text} ${className}`}
    >
      {showIcon ? (
        <IconComponent size={isSm ? 11 : 13} />
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      )}
      <span>{config.label}</span>
    </span>
  );
}
