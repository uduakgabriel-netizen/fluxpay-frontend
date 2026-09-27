import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, WifiOff, Clock, Coins, ShieldAlert, RefreshCw, XCircle, LucideIcon } from 'lucide-react';

export type ErrorCardType = 'network' | 'expired' | 'balance' | 'verification' | 'transaction' | 'wallet' | 'default';

const ERROR_CONFIGS: Record<string, { icon: LucideIcon; title: string; message: string; actionLabel: string }> = {
  network: {
    icon: WifiOff,
    title: 'Connection Lost',
    message: 'Check your internet connection and try again.',
    actionLabel: 'Retry Connection',
  },
  expired: {
    icon: Clock,
    title: 'Quote Expired',
    message: 'The guaranteed exchange rate has expired. Refresh to get a live rate.',
    actionLabel: 'Refresh Quote',
  },
  balance: {
    icon: Coins,
    title: 'Insufficient Balance',
    message: "You don't have enough tokens for this swap. Reduce the amount or fund your wallet.",
    actionLabel: 'Adjust Amount',
  },
  verification: {
    icon: AlertCircle,
    title: 'Account Verification Failed',
    message: "We couldn't verify this bank account. Please check the 10-digit number and bank selection.",
    actionLabel: 'Edit Account Details',
  },
  transaction: {
    icon: ShieldAlert,
    title: 'Transaction Failed',
    message: 'Something went wrong during settlement. Your crypto funds are safe.',
    actionLabel: 'Try Again',
  },
  wallet: {
    icon: XCircle,
    title: 'Wallet Not Connected',
    message: 'Please connect your Solana wallet to proceed with the swap.',
    actionLabel: 'Connect Wallet',
  },
  default: {
    icon: AlertCircle,
    title: 'An Error Occurred',
    message: 'Something went wrong. Please try again.',
    actionLabel: 'Retry',
  },
};

export interface ErrorCardProps {
  type?: ErrorCardType;
  title?: string;
  message?: string;
  actionLabel?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export default function ErrorCard({
  type = 'default',
  title,
  message,
  actionLabel,
  onRetry,
  onDismiss,
  className = '',
}: ErrorCardProps) {
  const config = ERROR_CONFIGS[type] || ERROR_CONFIGS.default;
  const IconComponent = config.icon;

  const displayTitle = title || config.title;
  const displayMessage = message || config.message;
  const displayAction = actionLabel || config.actionLabel;

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`p-5 rounded-2xl bg-rose-50/90 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 animate-shake relative overflow-hidden ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
          <IconComponent size={20} />
        </div>

        <div className="flex-1 space-y-1">
          <h4 className="font-bold text-xs sm:text-sm text-rose-950 dark:text-rose-200">
            {displayTitle}
          </h4>
          <p className="text-xs text-rose-800 dark:text-rose-300/90 leading-relaxed">
            {displayMessage}
          </p>

          {onRetry && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onRetry}
                className="py-1.5 px-3.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-rose-500/40 animate-pulse hover:animate-none"
              >
                <RefreshCw size={12} />
                <span>{displayAction}</span>
              </button>
            </div>
          )}
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200 p-1"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        )}
      </div>
    </motion.div>
  );
}
