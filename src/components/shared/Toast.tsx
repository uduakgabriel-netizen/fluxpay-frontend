import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X, LucideIcon } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  type?: ToastType;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  actionLabel?: string;
  onAction?: () => void;
  duration: number;
}

export interface ToastContextType {
  addToast: (message: string, options?: ToastOptions) => string;
  removeToast: (id: string) => void;
  success: (msg: string, opt?: ToastOptions) => string;
  error: (msg: string, opt?: ToastOptions) => string;
  warning: (msg: string, opt?: ToastOptions) => string;
  info: (msg: string, opt?: ToastOptions) => string;
}

const ToastContext = createContext<ToastContextType | null>(null);

const TOAST_TYPES: Record<ToastType, { icon: LucideIcon; iconColor: string; bg: string; text: string }> = {
  success: {
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800/80',
    text: 'text-emerald-950 dark:text-emerald-100',
  },
  error: {
    icon: AlertCircle,
    iconColor: 'text-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800/80',
    text: 'text-rose-950 dark:text-rose-100',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800/80',
    text: 'text-amber-950 dark:text-amber-100',
  },
  info: {
    icon: Info,
    iconColor: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-950/80 border-purple-300 dark:border-purple-800/80',
    text: 'text-purple-950 dark:text-purple-100',
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, options: ToastOptions = {}) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    const toast: ToastItem = {
      id,
      message,
      type: options.type || 'info',
      actionLabel: options.actionLabel,
      onAction: options.onAction,
      duration: options.duration || 4000,
    };

    setToasts((prev) => [...prev, toast]);

    if (toast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }

    return id;
  }, [removeToast]);

  const success = useCallback((msg: string, opt?: ToastOptions) => addToast(msg, { ...opt, type: 'success' }), [addToast]);
  const error = useCallback((msg: string, opt?: ToastOptions) => addToast(msg, { ...opt, type: 'error' }), [addToast]);
  const warning = useCallback((msg: string, opt?: ToastOptions) => addToast(msg, { ...opt, type: 'warning' }), [addToast]);
  const info = useCallback((msg: string, opt?: ToastOptions) => addToast(msg, { ...opt, type: 'info' }), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      
      {/* Fixed Bottom-Right Toast Container */}
      <div
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
        aria-live="polite"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const style = TOAST_TYPES[toast.type] || TOAST_TYPES.info;
            const Icon = style.icon;

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`pointer-events-auto p-4 rounded-2xl border shadow-xl backdrop-blur-xl flex items-center justify-between gap-3 ${style.bg}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`shrink-0 ${style.iconColor}`}>
                    <Icon size={20} />
                  </div>
                  <p className={`text-xs sm:text-sm font-semibold leading-snug ${style.text}`}>
                    {toast.message}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {toast.actionLabel && (
                    <button
                      type="button"
                      onClick={() => {
                        if (toast.onAction) toast.onAction();
                        removeToast(toast.id);
                      }}
                      className="text-xs font-bold px-2 py-1 rounded bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
                    >
                      {toast.actionLabel}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeToast(toast.id)}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                    aria-label="Close notification"
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      addToast: () => '',
      removeToast: () => {},
      success: (msg: string) => { console.log('Toast [success]:', msg); return ''; },
      error: (msg: string) => { console.log('Toast [error]:', msg); return ''; },
      warning: (msg: string) => { console.log('Toast [warning]:', msg); return ''; },
      info: (msg: string) => { console.log('Toast [info]:', msg); return ''; },
    };
  }
  return context;
}

export interface ToastProps {
  message: string;
  type?: ToastType;
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
}

export default function Toast({ message, type = 'info', actionLabel, onAction, onClose }: ToastProps) {
  const style = TOAST_TYPES[type] || TOAST_TYPES.info;
  const Icon = style.icon;

  return (
    <div className={`p-4 rounded-2xl border shadow-xl backdrop-blur-xl flex items-center justify-between gap-3 ${style.bg}`}>
      <div className="flex items-center gap-3">
        <Icon size={20} className={style.iconColor} />
        <p className={`text-xs sm:text-sm font-semibold leading-snug ${style.text}`}>{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
