import React from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';

const DEFAULT_STEPS = [
  { id: 1, title: 'Wallet Authorization', description: 'Confirming cryptographic signature' },
  { id: 2, title: 'On-chain Confirmation', description: 'Broadcasting to Solana network' },
  { id: 3, title: 'Fiat Settlement', description: 'Transferring funds to your bank account' },
];

export default function ProcessingSteps({
  steps = DEFAULT_STEPS,
  currentStep = 2, // 1-indexed
}) {
  return (
    <div className="space-y-4 max-w-sm mx-auto">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        const isPending = stepNum > currentStep;

        return (
          <div
            key={step.id || step.title}
            className={`p-4 rounded-2xl border transition-all flex items-center gap-3.5 ${
              isActive
                ? 'bg-purple-500/10 border-[#8B5CF6] shadow-md shadow-purple-500/10'
                : isCompleted
                ? 'bg-emerald-500/5 border-emerald-500/30'
                : 'bg-white/40 dark:bg-slate-900/40 border-slate-200/60 dark:border-white/[0.04] opacity-50'
            }`}
          >
            {/* Step Icon / Indicator */}
            <div className="shrink-0">
              {isCompleted ? (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20"
                >
                  <Check size={16} strokeWidth={3} />
                </motion.div>
              ) : isActive ? (
                <div className="w-8 h-8 rounded-full bg-purple-500/20 border-2 border-[#8B5CF6] text-[#8B5CF6] flex items-center justify-center">
                  <Loader2 size={16} className="animate-spin" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full border-2 border-slate-300 dark:border-slate-700 text-slate-400 flex items-center justify-center text-xs font-bold font-mono">
                  {stepNum}
                </div>
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <span className={`text-xs sm:text-sm font-bold block ${
                isActive ? 'text-[#8B5CF6] dark:text-purple-300' : isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-400'
              }`}>
                {step.title}
              </span>
              <span className="text-[11px] text-slate-400 block truncate">
                {step.description}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
