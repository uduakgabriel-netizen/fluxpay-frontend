import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useConsumer } from '@/contexts/ConsumerContext';
import ConsumerLayout from '@/components/Consumer/ConsumerLayout';
import TokenIcon from '@/components/Consumer/TokenIcon';
import PageTransition from '@/components/shared/PageTransition';

export default function Confirm() {
  const router = useRouter();
  const { sellState, numericAmount, fee, networkFee, netFiat } = useConsumer();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmAndSell = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      router.push('/sell/processing');
    }, 700);
  };

  const previewRows = [
    { label: 'Holder Name :', value: sellState.payoutDetails.accountName || 'UDUAK GABRIEL AKPAN' },
    { label: 'Payout Account :', value: `${sellState.payoutDetails.provider} ${sellState.payoutDetails.accountNumber}` },
    { label: 'Crypto Asset :', value: `${numericAmount.toLocaleString()} ${sellState.token.symbol}` },
    { label: 'Exchange Rate :', value: `1 ${sellState.token.symbol} ≈ ₦${sellState.token.rateNgn.toLocaleString()}` },
    { label: 'Exchange Date :', value: '24-Sep-2026' },
    { label: 'Subtotal Amount :', value: `${sellState.fiatSymbol}${(netFiat + fee).toLocaleString()}` },
    { label: 'FluxPay Fee :', value: `${sellState.fiatSymbol}${fee.toLocaleString()}` },
    { label: 'Network Fees :', value: `${sellState.fiatSymbol}${networkFee}` },
  ];

  return (
    <ConsumerLayout title="Payment Preview" backHref="/sell/payout" maxWidth="max-w-md">
      <PageTransition className="space-y-4">
        {/* Payment Preview Card (Matching Image 2 Screen 4) */}
        <div className="rounded-3xl bg-white dark:bg-slate-850 p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-purple-500/5 space-y-5">
          {/* Header Summary Pill */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <TokenIcon symbol={sellState.token.symbol} size="md" />
              <div>
                <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
                  You are selling
                </span>
                <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                  {numericAmount.toLocaleString()} {sellState.token.symbol}
                </span>
              </div>
            </div>

            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-teal-400 font-bold">
              <i className="ri-shield-check-line text-xl" />
            </div>
          </div>

          {/* Clean Row-by-Row Table (Matching Image 2 Screen 4) */}
          <div className="space-y-3 text-xs sm:text-sm">
            {previewRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {row.label}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-right">
                  {row.value}
                </span>
              </div>
            ))}

            {/* Total Cost / Payout Divider */}
            <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />

            <div className="flex items-center justify-between pt-1">
              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Total Payout :
              </span>
              <span className="text-xl sm:text-2xl font-black text-purple-600 dark:text-teal-400 font-mono">
                {sellState.fiatSymbol}{netFiat.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Bottom CTA Continue / Confirm Button (Matching Image 2 Screen 4) */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirmAndSell}
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-500 hover:to-teal-400 text-white font-bold text-base shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 transition-all mt-3 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>CONFIRM &amp; SELL</span>
                <i className="ri-arrow-right-line" />
              </>
            )}
          </motion.button>
        </div>
      </PageTransition>
    </ConsumerLayout>
  );
}
