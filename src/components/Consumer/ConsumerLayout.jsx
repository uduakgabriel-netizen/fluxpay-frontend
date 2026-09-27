import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useConsumer } from '@/contexts/ConsumerContext';
import ConsumerNavbar from '@/components/Consumer/ConsumerNavbar';

export default function ConsumerLayout({
  children,
  title,
  subtitle,
  backHref,
  hideNav = false,
  maxWidth = 'max-w-md'
}) {
  const router = useRouter();
  const { wallet } = useConsumer();

  const navItems = [
    { label: 'Home', href: '/sell/home', icon: 'ri-home-5-line', activeIcon: 'ri-home-5-fill' },
    { label: 'Activity', href: '/sell/transactions', icon: 'ri-bar-chart-2-line', activeIcon: 'ri-bar-chart-2-fill' },
    // Center Action is Exchange/Sell
    { label: 'Exchange', href: '/sell/sell', isCenter: true },
    { label: 'Wallets', href: '/sell/wallets', icon: 'ri-wallet-3-line', activeIcon: 'ri-wallet-3-fill' },
    { label: 'Setting', href: '/sell/settings', icon: 'ri-settings-4-line', activeIcon: 'ri-settings-4-fill' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white flex flex-col justify-between selection:bg-purple-600 selection:text-white relative overflow-x-hidden transition-colors">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-purple-600/10 dark:bg-purple-600/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-32 w-[350px] h-[350px] bg-teal-500/10 dark:bg-teal-500/10 rounded-full blur-[130px]" />
      </div>

      {/* Top Navbar */}
      <ConsumerNavbar backHref={backHref} title={title} />

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col justify-start items-center px-4 py-5 pb-28 md:pb-16 w-full">
        <motion.div
          key={router.asPath}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className={`w-full ${maxWidth} mx-auto`}
        >
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-4">
              {subtitle}
            </p>
          )}
          {children}
        </motion.div>
      </main>

      {/* Bottom Mobile/Desktop Navigation Bar (Matching Image 2 with floating center Exchange button) */}
      {!hideNav && wallet.connected && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-2xl border-t border-slate-200 dark:border-slate-800/80 py-2 px-3 shadow-lg">
          <div className="flex items-center justify-around max-w-md mx-auto relative">
            {navItems.map((item) => {
              if (item.isCenter) {
                const isExchangeActive = router.pathname === '/sell/sell';
                return (
                  <Link
                    key="exchange-center-btn"
                    href="/sell/sell"
                    className="relative -top-5 flex flex-col items-center group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      className={`w-13 h-13 rounded-2xl bg-gradient-to-tr from-purple-600 to-teal-400 p-3.5 flex items-center justify-center text-white shadow-xl shadow-teal-500/30 ring-4 ring-white dark:ring-[#0B0F19] transition-transform ${
                        isExchangeActive ? 'ring-purple-500/40' : ''
                      }`}
                    >
                      <i className="ri-arrow-left-right-line text-2xl font-bold" />
                    </motion.div>
                  </Link>
                );
              }

              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                    isActive
                      ? 'text-purple-600 dark:text-teal-400 font-bold'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <i className={`${isActive ? item.activeIcon : item.icon} text-xl`} />
                  <span className="text-[11px] font-semibold">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
