import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Logo from '@/components/Logo';

export default function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  return (
    <div className="consumer-bg min-h-screen text-white relative overflow-hidden flex flex-col justify-between selection:bg-[#8b5cf6] selection:text-white">
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.35, 0.2]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-purple-600/30 rounded-full blur-[140px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.3, 0.15]
          }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-10 -right-32 w-[500px] h-[500px] bg-indigo-700/25 rounded-full blur-[150px]"
        />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
      </div>

      {/* Top Navbar */}
      <nav className="relative z-20 max-w-6xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 p-1.5 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Logo />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Flux<span className="text-[#8b5cf6]">Pay</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors hidden sm:block"
          >
            Merchant Portal
          </Link>
          <Link
            href="/sell"
            className="text-xs sm:text-sm font-semibold py-2 px-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 hover:bg-purple-500/20 transition-all hover:scale-105 active:scale-95"
          >
            Sell Crypto
          </Link>
        </div>
      </nav>

      {/* Main Hero Container */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-16 my-auto w-full flex flex-col items-center text-center">
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-[#c084fc] text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm shadow-purple-500/10"
        >
          <span className="w-2 h-2 rounded-full bg-[#8b5cf6] animate-pulse" />
          The Web3 Payments & Liquidity Gateway
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-3xl leading-[1.15] text-white"
        >
          Accept any Solana token.{' '}
          <span className="bg-gradient-to-r from-[#c084fc] via-[#8b5cf6] to-[#a78bfa] bg-clip-text text-transparent">
            Get paid in your favorite one.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          className="text-base sm:text-lg text-[#9ca3af] max-w-2xl mt-5 mb-12 leading-relaxed"
        >
          Instant non-custodial settlements for merchants and lightning-fast fiat off-ramps for individuals. Powered by Solana and Jupiter.
        </motion.p>

        {/* Two Staggered CTA Cards */}
        <div className="relative w-full max-w-3xl">
          {/* Subtle pulsing glow behind the cards */}
          <motion.div
            animate={{
              opacity: [0.35, 0.6, 0.35],
              scale: [0.98, 1.02, 0.98]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-indigo-600/20 to-purple-600/30 rounded-3xl blur-2xl pointer-events-none"
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left"
          >
            {/* Card 1: For Businesses */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4, borderColor: 'rgba(139, 92, 246, 0.5)' }}
              className="consumer-glass p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden group border border-purple-500/20"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#c084fc] bg-purple-500/15 py-1 px-2.5 rounded-md border border-purple-500/20">
                    For Businesses
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-purple-300">
                    <i className="ri-building-line text-lg" />
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Accept crypto payments
                </h3>

                <p className="text-sm text-[#9ca3af] mb-6 leading-relaxed">
                  Accept 100+ Solana tokens on your store with automatic Jupiter swaps to USDC or your favorite asset. Non-custodial, 0.5% flat fee.
                </p>

                <ul className="space-y-2 mb-8 text-xs text-gray-300">
                  <li className="flex items-center gap-2">
                    <i className="ri-check-line text-emerald-400" />
                    <span>Hosted checkout & simple API</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="ri-check-line text-emerald-400" />
                    <span>Zero chargebacks & instant settlements</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="ri-check-line text-emerald-400" />
                    <span>Automated liquidity routing</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/dashboard"
                className="w-full py-3.5 px-6 rounded-xl btn-consumer-primary flex items-center justify-center gap-2 font-semibold text-sm group-hover:shadow-purple-500/40"
              >
                <span>Start Building</span>
                <i className="ri-arrow-right-line text-base transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            {/* Card 2: For Individuals */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4, borderColor: 'rgba(139, 92, 246, 0.6)' }}
              className="consumer-glass p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden group border border-purple-500/30 bg-purple-950/20"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/15 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-all pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#c084fc] bg-purple-500/20 py-1 px-2.5 rounded-md border border-purple-500/30">
                    For Individuals
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-200">
                    <i className="ri-flashlight-fill text-lg text-[#c084fc]" />
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Sell crypto for cash
                </h3>

                <p className="text-sm text-[#9ca3af] mb-6 leading-relaxed">
                  Turn SOL, BONK, USDC, or JUP into Nigerian Naira or local bank transfer in under 2 minutes directly to your OPay or bank.
                </p>

                <ul className="space-y-2 mb-8 text-xs text-gray-300">
                  <li className="flex items-center gap-2">
                    <i className="ri-check-line text-emerald-400" />
                    <span>Instant OPay & Bank payouts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="ri-check-line text-emerald-400" />
                    <span>Best market rates via Solana DEX</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="ri-check-line text-emerald-400" />
                    <span>No complex verification or waiting</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/sell"
                className="w-full py-3.5 px-6 rounded-xl btn-consumer-primary flex items-center justify-center gap-2 font-semibold text-sm group-hover:shadow-purple-500/40 relative overflow-hidden"
              >
                <span>Sell Crypto</span>
                <i className="ri-arrow-right-line text-base transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Trusted By Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-14 sm:mt-20 flex flex-col sm:flex-row items-center gap-4 sm:gap-8"
        >
          <span className="text-xs uppercase tracking-widest text-[#9ca3af] font-medium">
            Trusted by:
          </span>
          <div className="flex items-center gap-6 sm:gap-10">
            {[
              { name: 'Phantom', icon: '👻' },
              { name: 'Solflare', icon: '🔥' },
              { name: 'Jupiter', icon: '🪐' }
            ].map((partner) => (
              <div
                key={partner.name}
                className="flex items-center gap-2 text-sm sm:text-base font-semibold text-gray-400 hover:text-white transition-colors cursor-default"
              >
                <span>{partner.icon}</span>
                <span>{partner.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-purple-500/10 py-6 text-center text-xs text-[#9ca3af]">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 FluxPay. Built on Solana.</p>
          <div className="flex items-center gap-6">
            <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
            <Link href="/features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/status" className="hover:text-white transition-colors">Network Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
