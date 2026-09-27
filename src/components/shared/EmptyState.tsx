import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Inbox, Wallet, CreditCard, Coins, ArrowRight, LucideIcon } from 'lucide-react';

export type EmptyStateType = 'transactions' | 'wallets' | 'payout' | 'assets' | 'default';

const ICONS: Record<string, LucideIcon> = {
  transactions: Inbox,
  wallets: Wallet,
  payout: CreditCard,
  assets: Coins,
  default: Inbox,
};

export interface EmptyStateProps {
  type?: EmptyStateType;
  icon?: LucideIcon | React.ComponentType<{ size?: number; className?: string }>;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  type = 'default',
  icon: CustomIcon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className = '',
}: EmptyStateProps) {
  const IconComponent = CustomIcon || ICONS[type] || ICONS.default;

  // Defaults based on type
  const defaults: Record<string, { title: string; desc: string; action?: string; href?: string }> = {
    transactions: {
      title: 'No transactions yet',
      desc: 'You have not made any swaps or payouts yet. Sell your first crypto to get started.',
      action: 'Start a Swap',
      href: '/sell',
    },
    wallets: {
      title: 'No wallet connected',
      desc: 'Connect your Solana wallet (Phantom, Solflare) to view token balances and swap to fiat.',
      action: 'Connect Wallet',
    },
    payout: {
      title: 'No payout accounts',
      desc: 'Add a Nigerian bank or fintech account (OPay, PalmPay, GTBank, etc.) to receive fiat.',
      action: 'Add Bank Account',
    },
    assets: {
      title: 'No assets found',
      desc: 'Your Solana tokens and balances will automatically appear here once loaded.',
      action: 'Refresh Balances',
    },
    default: {
      title: 'No data available',
      desc: 'There are no items to display at this moment.',
      action: undefined,
    },
  };

  const finalTitle = title || defaults[type]?.title || defaults.default.title;
  const finalDesc = description || defaults[type]?.desc || defaults.default.desc;
  const finalActionLabel = actionLabel || defaults[type]?.action;
  const finalHref = actionHref || defaults[type]?.href;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#0f172a]/80 border border-gray-200 dark:border-purple-500/20 text-center relative overflow-hidden flex flex-col items-center justify-center ${className}`}
    >
      {/* Soft Purple Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Icon Box */}
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/10"
      >
        <IconComponent size={30} />
      </motion.div>

      {/* Title & Description */}
      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight mb-1.5">
        {finalTitle}
      </h3>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6 leading-relaxed">
        {finalDesc}
      </p>

      {/* Optional CTA */}
      {finalActionLabel && (
        finalHref ? (
          <Link
            href={finalHref}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          >
            <span>{finalActionLabel}</span>
            <ArrowRight size={14} />
          </Link>
        ) : (
          <button
            type="button"
            onClick={onAction}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          >
            <span>{finalActionLabel}</span>
            <ArrowRight size={14} />
          </button>
        )
      )}
    </motion.div>
  );
}
