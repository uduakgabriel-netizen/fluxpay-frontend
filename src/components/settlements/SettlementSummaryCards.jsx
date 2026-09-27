import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Wallet } from 'lucide-react';

export default function SettlementSummaryCards({
  pending = '₦0',
  thisMonth = '₦1,245,320',
  total = '₦5,230,000',
}) {
  const cards = [
    {
      title: 'Pending',
      value: pending,
      subtitle: 'Awaiting bank payout',
      icon: Clock,
      color: 'text-amber-500 dark:text-amber-400',
      badgeBg: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
    },
    {
      title: 'This Month',
      value: thisMonth,
      subtitle: 'Settled to bank in Sep',
      icon: Calendar,
      color: 'text-[#8B5CF6]',
      badgeBg: 'bg-purple-500/10 border-purple-500/20 text-[#8B5CF6]',
    },
    {
      title: 'Total',
      value: total,
      subtitle: 'Lifetime fiat settled',
      icon: Wallet,
      color: 'text-emerald-500 dark:text-emerald-400',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.05 }}
            className="rounded-2xl p-5 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-purple-500/20 shadow-lg shadow-purple-500/5 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {card.title}
              </span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${card.badgeBg}`}>
                <Icon size={16} />
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
              {card.value}
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              {card.subtitle}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
