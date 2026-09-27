import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useConsumer } from '@/contexts/ConsumerContext';
import { useTheme } from '@/contexts/ThemeContext';
import Logo from '@/components/Logo';

export default function ConsumerNavbar({ backHref, title }) {
  const router = useRouter();
  const { wallet, disconnectWallet } = useConsumer();
  const { isDark, toggleTheme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);

  const handleCopy = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const navLinks = [
    { label: 'Home', href: '/sell/home', icon: 'ri-home-5-line' },
    { label: 'Exchange', href: '/sell/sell', icon: 'ri-arrow-left-right-line' },
    { label: 'Wallets', href: '/sell/wallets', icon: 'ri-wallet-3-line' },
    { label: 'Activity', href: '/sell/transactions', icon: 'ri-history-line' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/90 dark:bg-[#0B0F19]/90 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left Section: Brand Logo + Badge / Back Button */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center transition-transform group-hover:scale-105">
              <Logo />
            </div>
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Flux<span className="text-purple-600 dark:text-teal-400">Pay</span>
            </span>
          </Link>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-teal-400 border border-purple-200/60 dark:border-purple-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            Sell Crypto
          </span>

          {backHref && (
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-teal-400 transition-colors px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs active:scale-95 ml-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden xs:inline">Back</span>
            </Link>
          )}
        </div>

        {/* Center Section: Desktop Navigation Links or Mobile Title */}
        <div className="flex items-center justify-center">
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-teal-400 border border-purple-200/60 dark:border-purple-800/60 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <i className={item.icon} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Title (shown only on mobile if title is provided) */}
          {title && (
            <span className="md:hidden font-bold text-sm text-slate-900 dark:text-white truncate max-w-[150px]">
              {title}
            </span>
          )}
        </div>

        {/* Right Section: Network Badge, Theme Toggle & Wallet Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Network indicator (Solana) */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Solana</span>
          </div>

          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-amber-400 transition-colors shadow-sm"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </motion.button>

          {/* Wallet Menu / Connect Button */}
          {wallet?.connected ? (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowWalletMenu(!showWalletMenu)}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono">{wallet.displayAddress}</span>
                <i className="ri-arrow-down-s-line text-xs" />
              </motion.button>

              <AnimatePresence>
                {showWalletMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 p-3 shadow-2xl z-50 border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-slate-500 dark:text-slate-400">{wallet.walletType} Wallet</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Connected</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-2.5 mb-2 flex items-center justify-between">
                      <span className="font-mono text-xs text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                        {wallet.address}
                      </span>
                      <button
                        onClick={handleCopy}
                        className="relative p-1 text-purple-600 dark:text-teal-400 hover:scale-110 transition-transform"
                        title="Copy Address"
                      >
                        <i className={copied ? "ri-check-line text-emerald-500" : "ri-file-copy-line"} />
                        {copied && (
                          <span className="absolute -top-7 right-0 text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded shadow">
                            Copied!
                          </span>
                        )}
                      </button>
                    </div>

                    <Link
                      href="/sell/wallets"
                      onClick={() => setShowWalletMenu(false)}
                      className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <i className="ri-wallet-3-line text-purple-500" />
                      <span>Manage Wallets</span>
                    </Link>

                    <button
                      onClick={() => {
                        setShowWalletMenu(false);
                        disconnectWallet();
                        router.push('/sell');
                      }}
                      className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors mt-1"
                    >
                      <i className="ri-logout-box-r-line" />
                      <span>Disconnect</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/sell"
              className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-500 hover:to-teal-400 text-white text-xs font-bold shadow-md shadow-purple-500/20 active:scale-95 transition-all"
            >
              Connect
            </Link>
          )}

          {/* Link back to Main Site */}
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            title="Go to FluxPay Merchant Landing"
          >
            <span>Exit</span>
            <i className="ri-logout-circle-r-line" />
          </Link>
        </div>

      </div>
    </header>
  );
}
