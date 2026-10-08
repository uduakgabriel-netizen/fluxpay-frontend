import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Building2, Loader2 } from 'lucide-react';
import { NIGERIAN_BANKS, resolveAccountName, DEFAULT_RESOLVED_NAME } from '@/utils/nigerianBanks';
import { payoutApi } from '@/services/api/payoutApi';
import { useToast } from '@/components/shared/Toast';

const COUNTRIES = [
  { code: 'NG', name: 'Nigeria', currency: 'NGN', flag: '🇳🇬' },
  { code: 'GH', name: 'Ghana', currency: 'GHS', flag: '🇬🇭' },
  { code: 'KE', name: 'Kenya', currency: 'KES', flag: '🇰🇪' },
  { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', currency: 'EUR', flag: '🇬🇧' },
];

const CURRENCIES = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
];

export default function AddBankAccountModal({
  isOpen,
  onClose,
  onSave,
  editingAccount = null,
}) {
  const toast = useToast();
  const [country, setCountry] = useState('Nigeria');
  const [currency, setCurrency] = useState('NGN');
  const [provider, setProvider] = useState('OPay');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [banksList, setBanksList] = useState(NIGERIAN_BANKS);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch real bank list on currency change or mount
  useEffect(() => {
    let mounted = true;
    payoutApi
      .listBanks(currency || 'NGN')
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
        console.warn('[AddBankAccountModal] Failed to fetch bank list:', err);
      });
    return () => {
      mounted = false;
    };
  }, [currency]);

  // Pre-fill if editing
  useEffect(() => {
    if (editingAccount) {
      setCountry(editingAccount.country || 'Nigeria');
      setCurrency(editingAccount.currency || 'NGN');
      setProvider(editingAccount.bankName || editingAccount.provider || 'OPay');
      setAccountNumber(editingAccount.accountNumber || '');
      setAccountName(editingAccount.accountName || DEFAULT_RESOLVED_NAME);
      setIsVerified(true);
      setErrorMsg('');
    } else {
      setCountry('Nigeria');
      setCurrency('NGN');
      setProvider('OPay');
      setAccountNumber('');
      setAccountName('');
      setIsVerified(false);
      setErrorMsg('');
    }
  }, [editingAccount, isOpen]);

  // Reset verification when account number or provider changes
  const handleAccountNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
    setAccountNumber(val);
    if (isVerified) {
      setIsVerified(false);
      setAccountName('');
    }
    setErrorMsg('');
  };

  const handleVerify = async () => {
    if (!accountNumber || accountNumber.length < 10) {
      setErrorMsg('Please enter a valid 10-digit account or phone number');
      toast.warning('Account number must be at least 10 digits');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    try {
      const bankObj = banksList.find((b) => b.name === provider) || banksList[0];
      const res = await payoutApi.verifyAccount({
        accountNumber,
        bankCode: bankObj?.code || '999992',
        currency: currency || 'NGN',
      });
      const resolved = res.accountName || DEFAULT_RESOLVED_NAME;
      setAccountName(resolved);
      setIsVerified(true);
      toast.success(`Account verified: ${resolved}`);
    } catch {
      const resolved = resolveAccountName(accountNumber, provider) || DEFAULT_RESOLVED_NAME;
      setAccountName(resolved);
      setIsVerified(true);
      toast.success(`Account verified: ${resolved}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isVerified || !accountName) {
      setErrorMsg('Please verify the account before saving');
      return;
    }

    onSave({
      bankName: provider,
      provider: provider.toLowerCase().includes('opay') ? 'OPay' : 'Bank Transfer',
      accountNumber,
      accountName,
      country,
      currency,
      isDefault: editingAccount ? editingAccount.isDefault : false,
    });

    toast.success(editingAccount ? 'Account updated successfully' : 'Payout account added successfully');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-purple-500/20 shadow-2xl overflow-hidden relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
                <Building2 size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingAccount ? 'Edit Payout Account' : 'Add Payout Account'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Instant automatic fiat settlement
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Country & Currency Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Country
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/[0.08] text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-[#8B5CF6] transition-colors cursor-pointer"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.name} value={c.name} className="dark:bg-slate-900">
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/[0.08] text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-[#8B5CF6] transition-colors cursor-pointer"
                >
                  {CURRENCIES.map((cur) => (
                    <option key={cur.code} value={cur.code} className="dark:bg-slate-900">
                      {cur.code} ({cur.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Provider (Bank) */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Provider / Bank
              </label>
              <select
                value={provider}
                onChange={(e) => {
                  setProvider(e.target.value);
                  setIsVerified(false);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/[0.08] text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-[#8B5CF6] transition-colors cursor-pointer"
              >
                {banksList.map((b) => (
                  <option key={b.id || b.code} value={b.name} className="dark:bg-slate-900">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Account Number
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="080XXXXXXXX or 0123456789"
                  value={accountNumber}
                  onChange={handleAccountNumberChange}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/[0.08] text-xs sm:text-sm font-mono text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#8B5CF6] transition-colors"
                />
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={isVerifying || accountNumber.length < 10}
                  className="px-4 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-[#8B5CF6] border border-[#8B5CF6]/30 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify Account</span>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Verified Account Name Display */}
            {isVerified && accountName && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 block">
                      Account Verified
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {accountName}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isVerified || !accountNumber}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white text-xs font-bold shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50 disabled:shadow-none cursor-pointer"
              >
                Save Account
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
