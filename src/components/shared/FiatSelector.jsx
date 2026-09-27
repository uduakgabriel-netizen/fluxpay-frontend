import React from 'react';

const DEFAULT_FIATS = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
];

export default function FiatSelector({
  fiats = DEFAULT_FIATS,
  selectedFiat = DEFAULT_FIATS[0],
  onSelect,
  label = 'Payout Currency',
}) {
  const current = selectedFiat || fiats[0];

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </label>
      )}

      <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/[0.08]">
        {fiats.map((fiat) => {
          const isSelected = (current.code || current) === fiat.code;
          return (
            <button
              key={fiat.code}
              type="button"
              onClick={() => onSelect && onSelect(fiat)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{fiat.flag}</span>
              <span>{fiat.code} ({fiat.symbol})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
