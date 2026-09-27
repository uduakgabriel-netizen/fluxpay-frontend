import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useConsumer } from '@/contexts/ConsumerContext';
import ConsumerLayout from '@/components/Consumer/ConsumerLayout';
import Skeleton, { CardSkeleton, RowSkeleton } from '@/components/shared/Skeleton';
import PageTransition from '@/components/shared/PageTransition';
import { useToast } from '@/components/shared/Toast';

export default function Settings() {
  const { wallet } = useConsumer();
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const [notifications, setNotifications] = useState({
    sms: true,
    email: true,
    push: false,
  });

  const [security, setSecurity] = useState({
    biometrics: true,
    passkeys: true,
    pinRequired: false,
  });

  const handleToggleNotification = (key) => {
    setNotifications((prev) => {
      const next = !prev[key];
      toast.info(`${key.toUpperCase()} notifications ${next ? 'enabled' : 'disabled'}`);
      return { ...prev, [key]: next };
    });
  };

  const handleToggleSecurity = (key) => {
    setSecurity((prev) => {
      const next = !prev[key];
      toast.info(`${key.toUpperCase()} setting updated`);
      return { ...prev, [key]: next };
    });
  };

  const sections = [
    {
      id: 'profile',
      title: 'Profile Details',
      icon: 'ri-user-3-line',
      desc: 'Account identity and verification status',
      render: (
        <div className="space-y-3 pt-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Account Name</span>
            <span className="font-bold text-slate-900 dark:text-white">UDUAK GABRIEL AKPAN</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">KYC Status</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
              Tier 2 (₦5,000,000/day)
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Email</span>
            <span className="text-slate-700 dark:text-slate-300 font-mono">u.akpan@example.com</span>
          </div>
        </div>
      )
    },
    {
      id: 'wallets',
      title: 'Connected Wallets',
      icon: 'ri-wallet-3-line',
      desc: 'Solana non-custodial addresses',
      render: (
        <div className="space-y-3 pt-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>👻</span> {wallet?.walletType || 'Phantom'} Wallet
              </div>
              <div className="font-mono text-slate-400 mt-0.5">{wallet?.displayAddress || '7xK...9Pq'}</div>
            </div>
            <Link
              href="/sell/wallets"
              className="text-purple-600 dark:text-teal-400 hover:underline font-bold text-xs"
            >
              Manage
            </Link>
          </div>
        </div>
      )
    },
    {
      id: 'payout',
      title: 'Saved Payout Methods',
      icon: 'ri-bank-card-line',
      desc: 'Nigerian bank accounts & OPay wallets',
      render: (
        <div className="space-y-2 pt-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 text-base">🟢</span>
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">OPay Wallet</span>
                <span className="text-slate-400 font-mono">080XXXXXXXX</span>
              </div>
            </div>
            <span className="text-[10px] text-purple-700 dark:text-teal-400 bg-purple-100 dark:bg-purple-950/50 px-2 py-0.5 rounded-full font-bold">
              Default
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-orange-500 text-base">🏦</span>
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">GTBank</span>
                <span className="text-slate-400 font-mono">0123456789</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-400">Secondary</span>
          </div>
        </div>
      )
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'ri-notification-3-line',
      desc: 'Payout alerts and exchange receipts',
      render: (
        <div className="space-y-3 pt-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">SMS Payout Alerts</span>
              <span className="text-slate-400 text-[11px]">Receive text upon bank deposit</span>
            </div>
            <button
              type="button"
              onClick={() => handleToggleNotification('sms')}
              className={`w-10 h-5 rounded-full transition-colors relative ${notifications.sms ? 'bg-gradient-to-r from-purple-600 to-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${notifications.sms ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">Email Receipts</span>
              <span className="text-slate-400 text-[11px]">Automated PDF receipt</span>
            </div>
            <button
              type="button"
              onClick={() => handleToggleNotification('email')}
              className={`w-10 h-5 rounded-full transition-colors relative ${notifications.email ? 'bg-gradient-to-r from-purple-600 to-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${notifications.email ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>
        </div>
      )
    }
  ];

  return (
    <ConsumerLayout title="Settings" maxWidth="max-w-md">
      <PageTransition className="space-y-4">
        {loading ? (
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 space-y-4">
            <Skeleton height="24px" width="40%" />
            <RowSkeleton count={4} />
          </div>
        ) : (
          <div className="rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-purple-500/5 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            {sections.map((sec) => {
              const isOpen = activeSection === sec.id;
              return (
                <div key={sec.id} className="p-4 sm:p-5 transition-colors">
                  <button
                    type="button"
                    onClick={() => setActiveSection(isOpen ? null : sec.id)}
                    className="w-full flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-teal-400 group-hover:scale-105 transition-transform">
                        <i className={`${sec.icon} text-lg`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-teal-400 transition-colors">
                          {sec.title}
                        </h3>
                        <p className="text-[11px] text-slate-400">{sec.desc}</p>
                      </div>
                    </div>

                    <i className={`ri-arrow-down-s-line text-lg text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-purple-600 dark:text-teal-400' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        {sec.render}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center text-xs text-slate-400 pt-2">
          FluxPay Consumer v1.0.0
        </div>
      </PageTransition>
    </ConsumerLayout>
  );
}
