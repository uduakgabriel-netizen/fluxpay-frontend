import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useConsumer } from '@/contexts/ConsumerContext';
import ConsumerLayout from '@/components/Consumer/ConsumerLayout';
import TokenIcon from '@/components/Consumer/TokenIcon';
import NumberCounter from '@/components/Consumer/NumberCounter';
import Keypad from '@/components/Consumer/Keypad';
import ErrorCard from '@/components/shared/ErrorCard';
import PageTransition from '@/components/shared/PageTransition';

export default function Sell() {
  const router = useRouter();
  const {
    tokens,
    sellState,
    numericAmount,
    grossFiat,
    fee,
    networkFee,
    netFiat,
    selectToken,
    setAmount,
    setSellState
  } = useConsumer();

  const [activeTab, setActiveTab] = useState('SELL');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showFiatModal, setShowFiatModal] = useState(false);

  // Keypad Handlers
  const handleKeypadPress = (val) => {
    let current = String(sellState.amount || '');
    if (val === '.') {
      if (current.includes('.')) return;
      if (!current) current = '0';
    }
    // If it was '0' and we type a number, replace 0
    if (current === '0' && val !== '.') {
      current = val;
    } else {
      current = current + val;
    }
    setAmount(current);
  };

  const handleKeypadBackspace = () => {
    let current = String(sellState.amount || '');
    if (current.length > 0) {
      current = current.slice(0, -1);
      setAmount(current || '0');
    }
  };

  const handleMaxClick = () => {
    setAmount(String(sellState.token.balance));
  };

  const handleGetQuote = () => {
    router.push('/sell/quote');
  };

  const fiatOptions = [
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
  ];

  return (
    <ConsumerLayout title="Exchange" backHref="/sell/home" maxWidth="max-w-md">
      <div className="space-y-4">
        {/* Segmented Pill Tabs (Matching Image 2 Screen 2: BUY | SELL | TRADE) */}
        <div className="p-1 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 shadow-sm flex items-center justify-between">
          {['BUY', 'SELL', 'TRADE'].map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                  isSelected
                    ? 'text-white shadow-md shadow-purple-500/20'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="exchange-tab-pill"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-teal-500 -z-0"
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            );
          })}
        </div>

        {/* Exchange Card (Matching Image 2 Screen 2) */}
        <div className="rounded-3xl bg-white dark:bg-slate-850 p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-purple-500/5 space-y-4 relative">
          {/* Source Token Section */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/70 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span>You Sell</span>
              <button
                type="button"
                onClick={handleMaxClick}
                className="font-bold text-purple-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                Balance: {sellState.token.balance} {sellState.token.symbol} (MAX)
              </button>
            </div>

            <div className="flex items-center justify-between gap-3">
              {/* Token Selector Button */}
              <button
                type="button"
                onClick={() => setShowTokenModal(true)}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 shadow-sm hover:border-purple-400 transition-all text-left flex-shrink-0"
              >
                <TokenIcon symbol={sellState.token.symbol} size="sm" />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {sellState.token.symbol}
                    </span>
                    <i className="ri-arrow-down-s-line text-xs text-slate-400" />
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    1 {sellState.token.symbol} ≈ ₦{sellState.token.rateNgn.toLocaleString()}
                  </span>
                </div>
              </button>

              {/* Amount Display */}
              <div className="text-right flex-1">
                <input
                  type="text"
                  readOnly
                  value={sellState.amount || '0'}
                  className="w-full text-right text-2xl sm:text-3xl font-black text-slate-900 dark:text-white bg-transparent outline-none font-mono"
                />
                <span className="text-[11px] text-slate-400 block">
                  ≈ {sellState.fiatSymbol}{grossFiat.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Floating Swap / Arrow Badge in Center */}
          <div className="flex justify-center -my-2 relative z-10">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-teal-500 text-white shadow-lg shadow-purple-500/25 flex items-center justify-center border-2 border-white dark:border-[#0B0F19]"
            >
              <i className="ri-arrow-up-down-line text-lg font-bold" />
            </motion.div>
          </div>

          {/* Target Fiat Section */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/70 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span>You Receive</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Live Payout Rate</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              {/* Fiat Currency Selector */}
              <button
                type="button"
                onClick={() => setShowFiatModal(true)}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 shadow-sm hover:border-teal-400 transition-all text-left flex-shrink-0"
              >
                <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-300 font-black flex items-center justify-center text-sm border border-teal-500/30">
                  {sellState.fiatSymbol}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {sellState.fiatCurrency}
                    </span>
                    <i className="ri-arrow-down-s-line text-xs text-slate-400" />
                  </div>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Local currency
                  </span>
                </div>
              </button>

              {/* Calculated Fiat Output */}
              <div className="text-right flex-1">
                <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-teal-400 font-mono truncate">
                  <NumberCounter
                    value={netFiat}
                    prefix={sellState.fiatSymbol}
                    duration={0.5}
                  />
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Fee: {sellState.fiatSymbol}{fee.toLocaleString()} (1%)
                </span>
              </div>
            </div>
          </div>

          {/* Insufficient Balance Error Card */}
          {numericAmount > sellState.token.balance && (
            <ErrorCard
              type="balance"
              message={`You don't have enough ${sellState.token.symbol}. Balance: ${sellState.token.balance} ${sellState.token.symbol}.`}
              actionLabel="Set to MAX"
              onRetry={handleMaxClick}
            />
          )}

          {/* Action CTA Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGetQuote}
            disabled={numericAmount <= 0 || numericAmount > sellState.token.balance}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-500 hover:to-teal-400 text-white font-bold text-base shadow-xl shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>SELL {sellState.token.symbol} →</span>
          </motion.button>
        </div>

        {/* Custom Touch Keypad (Matching Image 2 Screen 2) */}
        <div className="rounded-3xl bg-white/70 dark:bg-slate-900/60 p-3 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <Keypad
            onKeyPress={handleKeypadPress}
            onBackspace={handleKeypadBackspace}
          />
        </div>
      </div>

      {/* Token Select Modal */}
      <AnimatePresence>
        {showTokenModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Select Token</h3>
                <button
                  type="button"
                  onClick={() => setShowTokenModal(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <i className="ri-close-line text-xl" />
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {tokens.map((token) => (
                  <button
                    key={token.symbol}
                    type="button"
                    onClick={() => {
                      selectToken(token.symbol);
                      setShowTokenModal(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                      sellState.token.symbol === token.symbol
                        ? 'bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <TokenIcon symbol={token.symbol} size="md" />
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">{token.symbol}</div>
                        <div className="text-xs text-slate-400">{token.name}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                        {token.balance} {token.symbol}
                      </div>
                      <div className="text-xs text-purple-600 dark:text-teal-400 font-mono">
                        ≈ ₦{(token.balance * token.rateNgn).toLocaleString()}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fiat Currency Modal */}
      <AnimatePresence>
        {showFiatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Select Currency</h3>
                <button
                  type="button"
                  onClick={() => setShowFiatModal(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <i className="ri-close-line text-xl" />
                </button>
              </div>

              <div className="space-y-2">
                {fiatOptions.map((fiat) => (
                  <button
                    key={fiat.code}
                    type="button"
                    onClick={() => {
                      setSellState(prev => ({
                        ...prev,
                        fiatCurrency: fiat.code,
                        fiatSymbol: fiat.symbol
                      }));
                      setShowFiatModal(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                      sellState.fiatCurrency === fiat.code
                        ? 'bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-transparent text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sm">
                        {fiat.symbol}
                      </div>
                      <span className="font-semibold text-sm">{fiat.name}</span>
                    </div>
                    <span className="font-mono text-xs">{fiat.code}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConsumerLayout>
  );
}
