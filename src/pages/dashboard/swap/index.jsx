import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowUpDown, ChevronDown, Check, Info, ShieldCheck, Sparkles } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/layout';
import { useAuth } from '@/contexts/AuthContext';
import { useConsumer, TOKENS, FIATS } from '@/contexts/ConsumerContext';
import Skeleton, { CardSkeleton } from '@/components/shared/Skeleton';
import ErrorCard from '@/components/shared/ErrorCard';
import PageTransition from '@/components/shared/PageTransition';
import { useToast } from '@/components/shared/Toast';

export default function MerchantSwapPage() {
  const router = useRouter();
  const { merchant } = useAuth();
  const toast = useToast();
  const {
    selectedToken,
    setSelectedToken,
    cryptoAmount,
    setCryptoAmount,
    selectedFiat,
    setSelectedFiat,
    fiatAmount,
    activeQuote,
    generateQuote,
  } = useConsumer();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(timer);
  }, []);

  const tokenList = TOKENS || [];
  const fiatList = FIATS || [];

  const token = selectedToken || tokenList[0] || {
    symbol: 'SOL',
    name: 'Solana',
    balance: 2.45,
    rateNgn: 300153,
    iconBg: 'from-[#9945FF] to-[#14F195]',
  };

  const fiat = selectedFiat || fiatList[0] || {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira'
  };

  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showFiatModal, setShowFiatModal] = useState(false);
  const [inputVal, setInputVal] = useState(cryptoAmount || '1.5');
  const [errorMessage, setErrorMessage] = useState('');

  // Update context when input changes
  const handleAmountChange = (val) => {
    // Only allow numbers and decimal point
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setInputVal(val);
      if (setCryptoAmount) setCryptoAmount(val || '0');
      if (Number(val) > (token.balance || 0)) {
        setErrorMessage(`You don't have enough ${token.symbol}. Reduce the amount or add more.`);
      } else {
        setErrorMessage('');
      }
    }
  };

  const setMaxAmount = () => {
    const maxVal = (token.balance || 2.45).toString();
    setInputVal(maxVal);
    if (setCryptoAmount) setCryptoAmount(maxVal);
    setErrorMessage('');
    toast.info(`Set amount to maximum balance: ${maxVal} ${token.symbol}`);
  };

  const setPercentAmount = (pct) => {
    const bal = token.balance || 2.45;
    const val = ((bal * pct) / 100).toFixed(token.symbol === 'BONK' ? 0 : 4);
    setInputVal(val);
    if (setCryptoAmount) setCryptoAmount(val);
    setErrorMessage('');
  };

  const handleProceed = () => {
    if (!inputVal || Number(inputVal) <= 0) {
      setErrorMessage('Please enter a valid amount');
      return;
    }
    if (Number(inputVal) > (token.balance || 0)) {
      setErrorMessage(`Insufficient balance. Max is ${token.balance} ${token.symbol}`);
      return;
    }
    if (generateQuote) generateQuote();
    router.push('/dashboard/swap/payout');
  };

  const formattedFiat = Number(
    fiatAmount || (Number(inputVal || 0) * (token.rateNgn || 300153))
  ).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return (
    <DashboardLayout pageTitle="Swap to Fiat">
      <PageTransition className="max-w-2xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-white/[0.08]">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-300 transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                Swap to Fiat
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Instant Payout
                </span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Convert your business crypto earnings to cash directly in your bank account
              </p>
            </div>
          </div>

          {/* Wallet Address Chip */}
          <div className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 text-xs text-purple-700 dark:text-purple-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono">
              {merchant?.walletAddress
                ? `${merchant.walletAddress.slice(0, 4)}...${merchant.walletAddress.slice(-4)}`
                : 'Connected'}
            </span>
          </div>
        </div>

        {loading ? (
          <CardSkeleton rows={3} />
        ) : (
          /* Main Swap Card */
          <div className="bg-white dark:bg-[#0f172a]/90 border border-gray-200 dark:border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-xl shadow-purple-500/5 backdrop-blur-xl relative overflow-hidden">
            
            {/* Ambient Card Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* You Send Section */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  You send
                </span>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span>Balance:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {token.balance} {token.symbol}
                  </span>
                  <button
                    type="button"
                    onClick={setMaxAmount}
                    className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/60 transition-colors cursor-pointer"
                  >
                    MAX
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#1e1b4b]/40 border border-gray-200 dark:border-purple-500/20 focus-within:border-purple-500 transition-colors flex items-center justify-between gap-4">
                {/* Token Selector Trigger */}
                <button
                  type="button"
                  onClick={() => setShowTokenModal(true)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-white/10 hover:border-purple-400 dark:hover:border-purple-500 transition-all shrink-0 shadow-sm group cursor-pointer"
                >
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-tr ${token.iconBg} flex items-center justify-center text-white text-xs font-bold shadow`}>
                    {token.symbol.slice(0, 1)}
                  </div>
                  <span className="font-bold text-sm text-gray-900 dark:text-white">
                    {token.symbol}
                  </span>
                  <ChevronDown size={14} className="text-gray-400 group-hover:text-purple-500 transition-colors" />
                </button>

                {/* Amount Input */}
                <div className="flex-1 text-right">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={inputVal}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="w-full bg-transparent text-right font-black text-2xl sm:text-3xl text-gray-900 dark:text-white focus:outline-none placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Quick Percentage Chips */}
              <div className="flex items-center gap-2 pt-1">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setPercentAmount(pct)}
                    className="flex-1 py-1 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-white/[0.04] text-gray-600 dark:text-gray-400 hover:bg-purple-100 hover:text-purple-700 dark:hover:bg-purple-900/40 dark:hover:text-purple-300 transition-all border border-transparent hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer"
                  >
                    {pct}%
                  </button>
                ))}
              </div>

              {Number(inputVal) > (token.balance || 0) && (
                <div className="pt-2">
                  <ErrorCard
                    type="balance"
                    message={`You don't have enough ${token.symbol}. Reduce the amount or set to MAX.`}
                    actionLabel="Set MAX"
                    onRetry={setMaxAmount}
                  />
                </div>
              )}
            </div>

            {/* Swap Divider Button */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-white/10" />
              </div>
              <div className="relative z-10 w-10 h-10 rounded-2xl bg-white dark:bg-[#1e1b4b] border border-gray-200 dark:border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-lg shadow-purple-500/10">
                <ArrowUpDown size={18} />
              </div>
            </div>

            {/* You Receive Section */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  You receive (estimated)
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  Direct bank payout
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#1e1b4b]/40 border border-gray-200 dark:border-purple-500/20 flex items-center justify-between gap-4">
                {/* Fiat Currency Selector Trigger */}
                <button
                  type="button"
                  onClick={() => setShowFiatModal(true)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-white/10 hover:border-teal-400 dark:hover:border-teal-500 transition-all shrink-0 shadow-sm group cursor-pointer"
                >
                  <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shadow">
                    {fiat.symbol}
                  </span>
                  <span className="font-bold text-sm text-gray-900 dark:text-white">
                    {fiat.code}
                  </span>
                  <ChevronDown size={14} className="text-gray-400 group-hover:text-teal-500 transition-colors" />
                </button>

                {/* Calculated Fiat Output */}
                <div className="flex-1 text-right">
                  <span className="font-black text-2xl sm:text-3xl text-emerald-600 dark:text-teal-400">
                    {fiat.symbol}{formattedFiat}
                  </span>
                </div>
              </div>
            </div>

            {/* Exchange Rate & Fee Info */}
            <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mb-6">
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-purple-600 dark:text-purple-400" />
                <span>Exchange Rate:</span>
              </div>
              <span className="font-mono font-semibold text-gray-900 dark:text-white">
                1 {token.symbol} ≈ {fiat.symbol}{Number(token.rateNgn).toLocaleString()} {fiat.code}
              </span>
            </div>

            {/* Action CTA Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleProceed}
              disabled={Number(inputVal) <= 0 || Number(inputVal) > (token.balance || 0)}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#8B5CF6] via-indigo-600 to-[#7C3AED] hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-base shadow-xl shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>PROCEED TO PAYOUT</span>
              <span>→</span>
            </motion.button>

            {/* Non-custodial security badge */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 dark:text-gray-500 mt-4">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Guaranteed quote. Zero slippage. Instant bank transfer.</span>
            </div>

          </div>
        )}

      </PageTransition>

      {/* Token Selector Modal */}
      <AnimatePresence>
        {showTokenModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-gray-900 dark:text-white">Select Token</h3>
                <button
                  onClick={() => setShowTokenModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {tokenList.map((t) => {
                  const isSelected = t.symbol === token.symbol;
                  return (
                    <button
                      key={t.symbol}
                      onClick={() => {
                        if (setSelectedToken) setSelectedToken(t);
                        setShowTokenModal(false);
                        toast.info(`Selected ${t.symbol}`);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left ${
                        isSelected
                          ? 'bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800'
                          : 'hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${t.iconBg} flex items-center justify-center text-white text-xs font-bold shadow`}>
                          {t.symbol.slice(0, 1)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900 dark:text-white">{t.symbol}</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">{t.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-xs font-semibold text-gray-900 dark:text-white">{t.balance}</p>
                        {isSelected && <Check size={14} className="text-purple-600 dark:text-teal-400 ml-auto" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fiat Selector Modal */}
      <AnimatePresence>
        {showFiatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-gray-900 dark:text-white">Payout Currency</h3>
                <button
                  onClick={() => setShowFiatModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1.5">
                {fiatList.map((f) => {
                  const isSelected = f.code === fiat.code;
                  return (
                    <button
                      key={f.code}
                      onClick={() => {
                        if (setSelectedFiat) setSelectedFiat(f);
                        setShowFiatModal(false);
                        toast.info(`Currency set to ${f.code} (${f.name})`);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800'
                          : 'hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                          {f.symbol}
                        </span>
                        <div>
                          <p className="font-bold text-sm text-gray-900 dark:text-white">{f.code}</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">{f.name}</p>
                        </div>
                      </div>
                      {isSelected && <Check size={16} className="text-emerald-600 dark:text-teal-400" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
}
