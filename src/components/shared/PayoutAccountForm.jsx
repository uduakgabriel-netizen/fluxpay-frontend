import React, { useState, useEffect } from 'react';
import { Building2, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { NIGERIAN_BANKS } from '@/utils/nigerianBanks';
import { payoutApi } from '@/services/api/payoutApi';
import Skeleton from './Skeleton';

export default function PayoutAccountForm({
  initialAccount = null,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [provider, setProvider] = useState(initialAccount?.bankName || initialAccount?.provider || 'OPay');
  const [accountNumber, setAccountNumber] = useState(initialAccount?.accountNumber || '');
  const [accountName, setAccountName] = useState(initialAccount?.accountName || '');
  const [banksList, setBanksList] = useState(NIGERIAN_BANKS);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(!!initialAccount?.accountName);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let mounted = true;
    payoutApi
      .listBanks('NGN')
      .then((res) => {
        if (!mounted) return;
        if (res && Array.isArray(res.banks) && res.banks.length > 0) {
          setBanksList(
            res.banks.map((b) => ({
              id: b.code,
              code: b.code,
              name: b.name,
            }))
          );
        }
      })
      .catch((err) => {
        console.warn('[PayoutAccountForm] Failed to fetch bank list:', err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5">
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="rectangular" height="44px" />
        <Skeleton variant="rectangular" height="44px" />
        <Skeleton variant="rectangular" height="44px" />
      </div>
    );
  }

  const handleVerify = async () => {
    if (!accountNumber || accountNumber.length < 10) {
      setErrorMsg('Please enter a valid 10-digit account or phone number');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    try {
      const bankObj = banksList.find((b) => b.name === provider) || banksList[0];
      const res = await payoutApi.verifyAccount({
        accountNumber,
        bankCode: bankObj?.code || '999992',
        currency: 'NGN',
      });
      if (!res.accountName) throw new Error('Account name could not be verified');
      setAccountName(res.accountName);
      setIsVerified(true);
    } catch (err) {
      console.error('Bank verification failed:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Verification failed. Please check account details.');
      setIsVerified(false);
      setAccountName('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isVerified || !accountName) {
      setErrorMsg('Please verify the account before proceeding');
      return;
    }

    if (onSubmit) {
      onSubmit({
        bankName: provider,
        provider: provider.toLowerCase().includes('opay') ? 'OPay' : 'Bank Transfer',
        accountNumber,
        accountName,
        isVerified: true,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Provider Selector */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Destination Bank / Fintech
        </label>
        <select
          value={provider}
          onChange={(e) => {
            setProvider(e.target.value);
            setIsVerified(false);
          }}
          className="w-full px-3.5 py-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-white/[0.08] text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-[#8B5CF6] transition-colors"
        >
          {banksList.map((b) => (
            <option key={b.id || b.code} value={b.name} className="dark:bg-slate-900">
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Account Number Input + Verify */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Account Number
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={accountNumber}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 11);
              setAccountNumber(val);
              if (isVerified) setIsVerified(false);
              setErrorMsg('');
            }}
            placeholder="080XXXXXXXX or 0123456789"
            className="flex-1 px-3.5 py-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-white/[0.08] text-xs sm:text-sm font-mono text-slate-900 dark:text-white outline-none focus:border-[#8B5CF6] transition-colors"
          />
          <button
            type="button"
            onClick={handleVerify}
            disabled={isVerifying || accountNumber.length < 10}
            className="px-4 py-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#8B5CF6] border border-[#8B5CF6]/30 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
          >
            {isVerifying ? <Loader2 size={14} className="animate-spin" /> : 'Verify'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400">
          <AlertCircle size={14} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isVerified && accountName && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
              Verified Account Name
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {accountName}
            </span>
          </div>
        </div>
      )}

      <div className="pt-2 flex items-center gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!isVerified || !accountNumber}
          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white text-xs font-bold shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50 cursor-pointer"
        >
          Confirm Account
        </button>
      </div>
    </form>
  );
}
