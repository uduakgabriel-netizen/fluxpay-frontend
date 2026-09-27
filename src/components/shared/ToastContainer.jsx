import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info, LucideIcon } from 'lucide-react';
import { toastVariants } from '@/styles/animations';

const TOAST_ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const TOAST_THEMES = {
  success: {
    iconColor: 'text-emerald-500',
    bg: 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-800',
    text: 'text-emerald-950 dark:text-emerald-100',
  },
  error: {
    iconColor: 'text-rose-500',
    bg: 'bg-rose-50/95 dark:bg-rose-950/90 border-rose-300 dark:border-rose-800',
    text: 'text-rose-950 dark:text-rose-100',
  },
  warning: {
    iconColor: 'text-amber-500',
    bg: 'bg-amber-50/95 dark:bg-amber-950/90 border-amber-300 dark:border-amber-800',
    text: 'text-amber-950 dark:text-amber-100',
  },
  info: {
    iconColor: 'text-[#8B5CF6]',
    bg: 'bg-purple-50/95 dark:bg-purple-950/90 border-purple-300 dark:border-purple-800',
    text: 'text-purple-950 dark:text-purple-100',
  },
};

export default function ToastContainer({ toasts = [], onRemove }) {
  // Stacking: display maximum 3 toasts, oldest dismisses first
  const displayToasts = toasts.slice(-3);

  return (
    <div
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      aria-live="polite"
      role="region"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {displayToasts.map((toast) => {
          const type = toast.type || 'info';
          const theme = TOAST_THEMES[type] || TOAST_THEMES.info;
          const Icon = TOAST_ICONS[type] || TOAST_ICONS.info;

          return (
            <motion.div
              key={toast.id}
              layout
              variants={toastVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 ${theme.bg}`}
            >
              <div className="flex items-center gap-3">
                <div className={`shrink-0 ${theme.iconColor}`}>
                  <Icon size={20} />
                </div>
                <p className={`text-xs sm:text-sm font-semibold leading-snug ${theme.text}`}>
                  {toast.message}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {toast.actionLabel && (
                  <button
                    type="button"
                    onClick={() => {
                      if (toast.onAction) toast.onAction();
                      if (onRemove) onRemove(toast.id);
                    }}
                    className="text-xs font-bold px-2.5 py-1 rounded-lg bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  >
                    {toast.actionLabel}
                  </button>
                )}
                {onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(toast.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    aria-label="Close notification"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
