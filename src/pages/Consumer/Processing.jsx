import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useConsumer } from '@/contexts/ConsumerContext';
import ConsumerLayout from '@/components/Consumer/ConsumerLayout';
import PageTransition from '@/components/shared/PageTransition';

export default function Processing() {
  const router = useRouter();
  const { sellState, numericAmount, netFiat, fee, networkFee, addTransaction } = useConsumer();

  const [currentStepIndex, setCurrentStepIndex] = useState(2);
  const [walletApproved, setWalletApproved] = useState(false);

  const steps = [
    { title: 'Quote confirmed', desc: 'Guaranteed exchange rate locked' },
    { title: 'Transaction created', desc: 'Solana instructions generated' },
    { title: 'Waiting for wallet approval', desc: 'Signature needed to broadcast transfer' },
    { title: 'Crypto received', desc: 'Confirmed on Solana blockchain' },
    { title: 'Conversion', desc: 'Swapped to fiat liquidity pool' },
    { title: 'Fiat payout', desc: `Dispatched to ${sellState.payoutDetails.provider}` },
  ];

  useEffect(() => {
    let timer;

    if (currentStepIndex === 2 && walletApproved) {
      timer = setTimeout(() => {
        setCurrentStepIndex(3);
      }, 900);
    } else if (currentStepIndex === 3) {
      timer = setTimeout(() => {
        setCurrentStepIndex(4);
      }, 1000);
    } else if (currentStepIndex === 4) {
      timer = setTimeout(() => {
        setCurrentStepIndex(5);
      }, 1000);
    } else if (currentStepIndex === 5) {
      timer = setTimeout(() => {
        const newId = `FP-${Math.random().toString(36).substring(2, 6).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;
        addTransaction({
          id: newId,
          token: sellState.token.symbol,
          tokenAmount: numericAmount.toLocaleString(),
          fiatAmount: netFiat.toLocaleString(),
          currency: sellState.fiatCurrency,
          method: sellState.payoutDetails.provider,
          destination: `${sellState.payoutDetails.provider} ${sellState.payoutDetails.accountNumber}`,
          recipient: sellState.payoutDetails.accountName,
          status: 'Completed',
          txHash: `5K${Math.random().toString(36).substring(2, 10).toUpperCase()}...${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          payoutRef: `BR-${Math.floor(10000000 + Math.random() * 90000000)}`,
          date: 'Just now',
          rate: `1 ${sellState.token.symbol} = ₦${sellState.token.rateNgn.toLocaleString()}`,
          fee: `₦${fee.toLocaleString()}`,
          networkFee: `₦${networkFee}`
        });

        router.push(`/sell/success?txId=${newId}`);
      }, 900);
    }

    return () => clearTimeout(timer);
  }, [currentStepIndex, walletApproved]);

  const handleApproveWallet = () => {
    setWalletApproved(true);
    setCurrentStepIndex(3);
  };

  return (
    <ConsumerLayout title="Processing" hideNav maxWidth="max-w-md">
      <PageTransition className="space-y-4">
        {/* Steps List Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-850 p-6 sm:p-7 space-y-6 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-purple-500/5">
          <div className="text-center pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Selling Crypto</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Please wait while your transfer is verified and paid out
            </p>
          </div>

          <div className="space-y-4">
            {steps.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isActive = idx === currentStepIndex;

              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className={`flex items-start gap-3.5 transition-all duration-300 ${
                    isCompleted ? 'opacity-60' : isActive ? 'opacity-100 scale-[1.01]' : 'opacity-30'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {isCompleted ? (
                      <div className="w-6 h-6 rounded-full bg-teal-500/15 border border-teal-500 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                        <i className="ri-check-line text-sm font-bold" />
                      </div>
                    ) : isActive ? (
                      <div className="relative w-6 h-6 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-600 to-teal-500 shadow-md" />
                        <div className="absolute inset-0 rounded-full bg-teal-500/40 animate-ping" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${isActive ? 'text-slate-900 dark:text-white' : isCompleted ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>
                        {step.title}
                      </span>
                      {isActive && (
                        <span className="text-[10px] text-teal-700 dark:text-teal-300 font-bold bg-teal-100 dark:bg-teal-950/50 px-2 py-0.5 rounded-full border border-teal-300 dark:border-teal-800 animate-pulse">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Interactive Wallet Approval Prompt */}
          <AnimatePresence>
            {currentStepIndex === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                    <i className="ri-wallet-3-line text-lg" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Approve Transfer</h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Transfer {numericAmount.toLocaleString()} {sellState.token.symbol} to FluxPay
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleApproveWallet}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
                >
                  <i className="ri-check-line text-sm" />
                  <span>Approve in Wallet</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageTransition>
    </ConsumerLayout>
  );
}
