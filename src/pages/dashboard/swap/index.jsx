import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowUpDown, ChevronDown, Check, Sparkles, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/layout';
import { useAuth } from '@/contexts/AuthContext';
import { useConsumer, FIATS } from '@/contexts/ConsumerContext';
import { useMerchantSwap } from '@/contexts/MerchantSwapContext';
import { assetsApi } from '@/services/api/assetsApi';
import { quoteApi } from '@/services/api/quoteApi';
import Skeleton, { CardSkeleton } from '@/components/shared/Skeleton';
import ErrorCard from '@/components/shared/ErrorCard';
import PageTransition from '@/components/shared/PageTransition';
import { useToast } from '@/components/shared/Toast';

export default function MerchantSwapPage() {
  const router = useRouter();
  const { merchant } = useAuth();
  const toast = useToast();
  const {
    sourceToken: swapContextToken,
    setSourceToken: setSwapContextToken,
    sourceAmount: swapContextAmount,
    setSourceAmount: setSwapContextAmount,
    fiatCurrency: swapContextFiat,
    setFiatCurrency: setSwapContextFiat,
    setActiveQuote: setSwapActiveQuote,
  } = useMerchantSwap();

  const [tokens, setTokens] = useState([]);
  const [selectedToken, setSelectedToken] = useState(swapContextToken || null);
  const [selectedFiat, setSelectedFiat] = useState(swapContextFiat || FIATS[0]);
  const [inputVal, setInputVal] = useState(swapContextAmount || '1');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showFiatModal, setShowFiatModal] = useState(false);

  // Real live quote state
  const [quote, setQuote] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);

  const quoteRequestRef = useRef(0);

  // 1. Fetch real sellable tokens from backend
  useEffect(() => {
    let mounted = true;
    assetsApi
      .getSellableTokens()
      .then((res) => {
        if (!mounted) return;
        if (res?.tokens && res.tokens.length > 0) {
          const mapped = res.tokens.map((t) => ({
            symbol: t.symbol,
            name: t.name,
            mint: t.mint,
            decimals: t.decimals,
            balance: t.balance !== undefined ? t.balance : 0,
            iconBg: t.symbol === 'SOL'
              ? 'from-[#9945FF] to-[#14F195]'
              : t.symbol === 'USDC'
              ? 'from-[#2775CA] to-[#0A4B8A]'
              : t.symbol === 'USDT'
              ? 'from-[#26A17B] to-[#176249]'
              : 'from-[#F18E38] to-[#D4501D]',
          }));
          setTokens(mapped);
          const defaultTok = mapped.find((m) => m.symbol === 'USDT') || mapped.find((m) => m.symbol === 'SOL') || mapped[0];
          setSelectedToken(defaultTok);
          if (setContextToken) setContextToken(defaultTok);
        }
      })
      .catch((err) => {
        console.error('[MerchantSwap] Failed to load sellable tokens:', err);
        setQuoteError('Failed to load token list from backend. Please refresh.');
      });

    return () => {
      mounted = false;
    };
  }, []);

  // 2. Fetch real quote from POST /api/offramp/quote
  const fetchQuote = useCallback(async () => {
    if (!selectedToken || !inputVal || Number(inputVal) <= 0) {
      setQuote(null);
      return;
    }

    const requestId = ++quoteRequestRef.current;
    setLoadingQuote(true);
    setQuoteError('');

    try {
      const q = await quoteApi.generateQuote({
        sourceToken: selectedToken.symbol,
        sourceMint: selectedToken.mint,
        sourceAmount: inputVal,
        fiatCurrency: selectedFiat.code,
      });

      if (requestId === quoteRequestRef.current) {
        setQuote(q);
        setSwapActiveQuote(q);
        // Calculate remaining seconds from real expiresAt
        if (q.expiresAt) {
          const diff = Math.max(1, Math.floor((new Date(q.expiresAt).getTime() - Date.now()) / 1000));
          setTimeLeft(Math.min(30, diff));
        } else {
          setTimeLeft(30);
        }
      }
    } catch (err) {
      if (requestId === quoteRequestRef.current) {
        console.error('[MerchantSwap] Quote request error:', err);
        setQuote(null);
        setSwapActiveQuote(null);
        setQuoteError(err?.message || 'Failed to fetch live quote from backend');
      }
    } finally {
      if (requestId === quoteRequestRef.current) {
        setLoadingQuote(false);
      }
    }
  }, [selectedToken, inputVal, selectedFiat, setSwapActiveQuote]);

  // Debounced quote fetch on input/token/fiat change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuote();
    }, 350);
    return () => clearTimeout(timer);
  }, [fetchQuote]);

  // 3. Countdown timer & auto-refresh on expiry
  useEffect(() => {
    if (!quote || loadingQuote) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Quote expired: auto-refresh
          fetchQuote();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quote, loadingQuote, fetchQuote]);

  // Handle amount change
  const handleAmountChange = (val) => {
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setInputVal(val);
      setSwapContextAmount(val || '0');
    }
  };

  const handleProceed = () => {
    if (!quote) {
      toast.error('Please wait for a live quote before proceeding');
      return;
    }
    setSwapContextToken(selectedToken);
    setSwapContextAmount(inputVal);
    setSwapContextFiat(selectedFiat);
    setSwapActiveQuote(quote);
    router.push('/dashboard/swap/payout');
  };

  const currentToken = selectedToken || tokens[0] || { symbol: 'USDT', iconBg: 'from-[#26A17B] to-[#176249]' };
  const currentFiat = selectedFiat || FIATS[0];

  const formatRate = (rateVal) => {
    const num = Number(rateVal);
    if (isNaN(num) || num === 0) return '—';
    if (num < 0.001) return num.toFixed(8);
    if (num < 1) return num.toFixed(4);
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  };

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
                  Live API
                </span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Convert crypto earnings to direct bank account payouts with real-time rates
              </p>
            </div>
          </div>

          {/* Wallet / Status Chip */}
          <div className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 text-xs text-purple-700 dark:text-purple-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono">
              {merchant?.walletAddress
                ? `${merchant.walletAddress.slice(0, 4)}...${merchant.walletAddress.slice(-4)}`
                : 'Connected'}
            </span>
          </div>
        </div>

        {/* Main Swap Card */}
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
                <span>Asset:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {currentToken.symbol}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#1e1b4b]/40 border border-gray-200 dark:border-purple-500/20 focus-within:border-purple-500 transition-colors flex items-center justify-between gap-4">
              {/* Token Selector Trigger */}
              <button
                type="button"
                onClick={() => setShowTokenModal(true)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-white/10 hover:border-purple-400 dark:hover:border-purple-500 transition-all shrink-0 shadow-sm group cursor-pointer"
              >
                <div className={`w-7 h-7 rounded-full bg-gradient-to-tr ${currentToken.iconBg || 'from-purple-500 to-indigo-500'} flex items-center justify-center text-white text-xs font-bold shadow`}>
                  {currentToken.symbol.slice(0, 1)}
                </div>
                <span className="font-bold text-sm text-gray-900 dark:text-white">
                  {currentToken.symbol}
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

            {/* Quick Amount Chips */}
            <div className="flex items-center gap-2 pt-1">
              {['1', '5', '10', '50'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAmountChange(val)}
                  className="flex-1 py-1 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-white/[0.04] text-gray-600 dark:text-gray-400 hover:bg-purple-100 hover:text-purple-700 dark:hover:bg-purple-900/40 dark:hover:text-purple-300 transition-all border border-transparent hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer"
                >
                  {val} {currentToken.symbol}
                </button>
              ))}
            </div>
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
                You receive (live quote)
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
                  {currentFiat.symbol}
                </span>
                <span className="font-bold text-sm text-gray-900 dark:text-white">
                  {currentFiat.code}
                </span>
                <ChevronDown size={14} className="text-gray-400 group-hover:text-teal-500 transition-colors" />
              </button>

              {/* Calculated Fiat Output */}
              <div className="flex-1 text-right">
                {loadingQuote ? (
                  <div className="flex items-center justify-end gap-2 text-gray-400">
                    <RefreshCw size={18} className="animate-spin text-purple-500" />
                    <span className="text-sm font-semibold">Fetching live quote...</span>
                  </div>
                ) : quote ? (
                  <span className="font-black text-2xl sm:text-3xl text-emerald-600 dark:text-teal-400">
                    {currentFiat.symbol}{Number(quote.netAmount || quote.fiatAmount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                ) : (
                  <span className="font-black text-2xl sm:text-3xl text-gray-400">
                    {currentFiat.symbol}0.00
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quote Error Card if API fails */}
          {quoteError && (
            <div className="mb-4">
              <ErrorCard
                type="network"
                message={quoteError}
                actionLabel="Retry Live Quote"
                onRetry={fetchQuote}
              />
            </div>
          )}

          {/* Real Live Exchange Rate & 30s Expiry Countdown */}
          {quote && (
            <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-600 dark:text-gray-300 mb-6">
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-purple-600 dark:text-purple-400" />
                <span>Exchange Rate:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">
                  1 {currentToken.symbol} ≈ {currentFiat.symbol}{formatRate(quote.rate)} {currentFiat.code}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  Fee: {currentFiat.symbol}{quote.fee}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] font-bold font-mono">
                  {timeLeft}s
                </span>
              </div>
            </div>
          )}

          {/* Action CTA Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleProceed}
            disabled={!quote || loadingQuote || Number(inputVal) <= 0}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#8B5CF6] via-indigo-600 to-[#7C3AED] hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-base shadow-xl shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingQuote ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>Fetching Quote...</span>
              </>
            ) : (
              <>
                <span>PROCEED TO PAYOUT</span>
                <span>→</span>
              </>
            )}
          </motion.button>

          {/* Non-custodial security badge */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 dark:text-gray-500 mt-4">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Real backend quote. Zero slippage. Instant bank transfer.</span>
          </div>

        </div>

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
                {tokens.map((t) => {
                  const isSelected = t.symbol === currentToken.symbol;
                  return (
                    <button
                      key={t.symbol}
                      onClick={() => {
                        setSelectedToken(t);
                        if (setContextToken) setContextToken(t);
                        setShowTokenModal(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left ${
                        isSelected
                          ? 'bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800'
                          : 'hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${t.iconBg || 'from-purple-500 to-indigo-500'} flex items-center justify-center text-white text-xs font-bold shadow`}>
                          {t.symbol.slice(0, 1)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900 dark:text-white">{t.symbol}</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">{t.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
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
                {FIATS.map((f) => {
                  const isSelected = f.code === currentFiat.code;
                  return (
                    <button
                      key={f.code}
                      onClick={() => {
                        setSelectedFiat(f);
                        if (setContextFiat) setContextFiat(f);
                        setShowFiatModal(false);
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
