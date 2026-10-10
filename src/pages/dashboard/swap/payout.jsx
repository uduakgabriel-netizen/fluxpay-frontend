import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  Plus,
  Building2,
  User,
  CreditCard,
  ShieldCheck,
  Search,
  Check,
  ChevronDown,
  Sparkles,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/layout';
import { useMerchantSwap } from '@/contexts/MerchantSwapContext';
import { payoutApi } from '@/services/api/payoutApi';
import PageTransition from '@/components/shared/PageTransition';
import EmptyState from '@/components/shared/EmptyState';
import { useToast } from '@/components/shared/Toast';

export default function MerchantSwapPayoutPage() {
  const router = useRouter();
  const toast = useToast();
  const accountInputRef = useRef(null);
  const {
    activeQuote,
    selectedAccount,
    setSelectedAccount,
    fiatCurrency,
    isHydrated,
  } = useMerchantSwap();

  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [activeTab, setActiveTab] = useState('saved');
  const [banksList, setBanksList] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [selectedBank, setSelectedBank] = useState(null);
  const [bankSearch, setBankSearch] = useState('');
  const [showBankModal, setShowBankModal] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [userConfirmedName, setUserConfirmedName] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  // If hydrated and no active quote, redirect to step 1
  useEffect(() => {
    if (isHydrated && !activeQuote) {
      toast.warning('Please select an amount to get a quote first');
      router.replace('/dashboard/swap');
    }
  }, [isHydrated, activeQuote, router, toast]);

  // 1. Fetch saved merchant accounts from GET /api/payout-accounts
  useEffect(() => {
    let mounted = true;
    setLoadingAccounts(true);
    payoutApi
      .listAccounts()
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res) ? res : (res?.accounts || []);
        setAccounts(list);
        if (list.length > 0) {
          if (!selectedAccount) {
            const def = list.find((a) => a.isDefault) || list[0];
            setSelectedAccount(def);
          }
          setActiveTab('saved');
        } else {
          setActiveTab('new');
        }
      })
      .catch((err) => {
        console.warn('[MerchantSwapPayout] Failed to fetch accounts:', err);
      })
      .finally(() => {
        if (mounted) setLoadingAccounts(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // 1. Fetch real bank list from OneLiquidity via GET /api/payout-accounts/banks
  useEffect(() => {
    let mounted = true;
    setLoadingBanks(true);
    payoutApi
      .listBanks('NGN')
      .then((res) => {
        if (!mounted) return;
        if (res?.banks && Array.isArray(res.banks) && res.banks.length > 0) {
          setBanksList(res.banks);
          setSelectedBank(res.banks[0]);
        }
      })
      .catch((err) => {
        console.error('[MerchantSwapPayout] Failed to fetch bank list:', err);
        toast.error('Failed to load banks from server. Please retry.');
      })
      .finally(() => {
        if (mounted) setLoadingBanks(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Sync tab if accounts change
  useEffect(() => {
    if (accounts.length === 0) {
      setActiveTab('new');
    }
  }, [accounts.length]);

  // Verification helper calling real OneLiquidity API
  const verifyCurrentAccount = async (num, bank) => {
    if (!num || num.length !== 10 || !bank?.code) return;
    setIsVerifying(true);
    setVerificationError('');
    setIsVerified(false);
    setUserConfirmedName(false);
    setAccountName('');

    try {
      const res = await payoutApi.verifyAccount({
        accountNumber: num,
        bankCode: bank.code,
        currency: 'NGN',
      });
      if (res?.accountName) {
        setAccountName(res.accountName);
        setIsVerified(true);
        toast.success(`Account verified: ${res.accountName}`);
      } else {
        setIsVerified(false);
        setVerificationError("We couldn't verify this account. Check the number and try again.");
        toast.error("We couldn't verify this account. Check the number and try again.");
      }
    } catch (err) {
      console.error('[MerchantSwapPayout] Verification error:', err);
      setIsVerified(false);
      setAccountName('');
      const msg = err?.message || "We couldn't verify this account. Check the number and try again.";
      setVerificationError(msg);
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  // Change handler
  const handleAccountNumChange = (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 10);
    setAccountNumber(clean);
    setIsVerified(false);
    setUserConfirmedName(false);
    setAccountName('');
    setVerificationError('');
  };

  // Fix 1: Auto-Fetch on Blur
  const handleAccountNumberBlur = async () => {
    if (accountNumber.length !== 10 || !selectedBank) {
      return;
    }
    await verifyCurrentAccount(accountNumber, selectedBank);
  };

  // Bank select handler
  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
    setShowBankModal(false);
    setIsVerified(false);
    setUserConfirmedName(false);
    setAccountName('');
    setVerificationError('');
    if (accountNumber.length === 10) {
      verifyCurrentAccount(accountNumber, bank);
    }
  };

  // Auto-verify debounce after 500ms when 10 digits reached and bank is selected
  useEffect(() => {
    if (accountNumber.length === 10 && selectedBank?.code && !isVerified && !isVerifying) {
      const timer = setTimeout(() => {
        verifyCurrentAccount(accountNumber, selectedBank);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [accountNumber, selectedBank?.code]);

  // Fix 3: canSave requirement
  const canSave =
    accountNumber.length === 10 &&
    Boolean(selectedBank?.code) &&
    Boolean(accountName) &&
    userConfirmedName &&
    isVerified &&
    !isSaving;

  const handleContinue = () => {
    const acc = selectedAccount || (accounts.length > 0 ? accounts[0] : null);
    if (!acc) {
      toast.error('Please select a payout account');
      return;
    }
    setSelectedAccount(acc);
    router.push('/dashboard/swap/confirm');
  };

  const handleContinueWithSaved = handleContinue;

  // Fix 5: Save immediately upon name verification ("Yes, continue")
  const handleConfirmName = async () => {
    setIsSaving(true);
    try {
      console.log('[ConfirmName] Saving account immediately upon verification:', {
        accountNumber,
        bankCode: selectedBank?.code,
        bankName: selectedBank?.name,
        currency: 'NGN',
        accountName,
      });

      const saved = await payoutApi.createAccount({
        accountNumber,
        bankCode: selectedBank.code,
        bankName: selectedBank.name,
        currency: 'NGN',
        accountName,
        setDefault: true,
      });

      console.log('[ConfirmName] Response:', saved);
      console.log('[ConfirmName] Saved account ID:', saved?.id);

      if (!saved?.id) {
        throw new Error('Account save failed — no ID returned');
      }

      setSelectedAccount(saved);
      setUserConfirmedName(true);
      toast.success('Account verified and saved!');
    } catch (err) {
      console.error('[ConfirmName] Failed to save account:', err);
      toast.error('Could not save account: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  // Fix 1: Save First, Then Navigate ("SAVE & CONTINUE")
  const handleContinueWithNew = async () => {
    if (!canSave) return;

    // Check if account was already saved with valid ID
    if (selectedAccount?.id && selectedAccount?.accountNumber?.replace(/\D/g, '').endsWith(accountNumber.slice(-4))) {
      console.log('[Save] Account already saved with ID:', selectedAccount.id);
      router.push('/dashboard/swap/confirm');
      return;
    }

    setIsSaving(true);
    try {
      console.log('[Save] Payload:', {
        accountNumber,
        bankCode: selectedBank?.code,
        bankName: selectedBank?.name,
        accountName,
        currency: 'NGN',
      });

      const saved = await payoutApi.createAccount({
        accountNumber,
        bankCode: selectedBank.code,
        bankName: selectedBank.name,
        currency: 'NGN',
        accountName,
        setDefault: true,
      });

      console.log('[Save] Response:', saved);
      console.log('[Save] Saved account ID:', saved?.id);

      if (!saved?.id) {
        throw new Error('Account save failed — no ID returned');
      }

      setSelectedAccount(saved);
      toast.success('Account saved');
      router.push('/dashboard/swap/confirm');
    } catch (err) {
      console.error('[Save] Failed:', err);
      toast.error('Could not save account: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const filteredBanks = banksList.filter((b) =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
    b.code.includes(bankSearch)
  );

  return (
    <DashboardLayout pageTitle="Select Payout Destination">
      <PageTransition className="max-w-2xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-white/[0.08]">
          <Link
            href="/dashboard/swap"
            className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-300 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              Payout Destination
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                Direct Bank Transfer
              </span>
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Select or add the bank account where your fiat will be deposited
            </p>
          </div>
        </div>

        {/* Tab Switcher: Saved vs New */}
        <div className="flex p-1 rounded-2xl bg-gray-100 dark:bg-slate-900/80 border border-gray-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            disabled={accounts.length === 0}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-white dark:bg-[#1e1b4b] text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            Saved Accounts ({accounts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'new'
                ? 'bg-white dark:bg-[#1e1b4b] text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            + Add New Bank Account
          </button>
        </div>

        {/* Tab 1: Saved Accounts */}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            {accounts.length === 0 ? (
              <EmptyState
                type="accounts"
                title="No saved payout accounts"
                description="Add your first verified bank account to receive payouts."
                actionLabel="Add Bank Account"
                onAction={() => setActiveTab('new')}
              />
            ) : (
              <div className="space-y-3">
                {accounts.map((acc) => {
                  const isSelected = selectedAccount?.id === acc.id || (!selectedAccount && acc.isDefault);
                  return (
                    <motion.div
                      key={acc.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setSelectedAccount(acc)}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isSelected
                          ? 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-500 shadow-md shadow-purple-500/10'
                          : 'bg-white dark:bg-slate-900/60 border-gray-200 dark:border-white/10 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900 dark:text-white">{acc.bankName}</p>
                          <p className="text-xs font-mono text-gray-500 dark:text-gray-400">{acc.accountNumber} · {acc.accountName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {acc.isDefault && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
                            Default
                          </span>
                        )}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-purple-600 bg-purple-600 text-white' : 'border-gray-300'
                        }`}>
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleContinue}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#8B5CF6] via-indigo-600 to-[#7C3AED] hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-base shadow-xl shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  <span>CONTINUE TO CONFIRMATION</span>
                  <span>→</span>
                </motion.button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Add New Account with Real Verification */}
        {activeTab === 'new' && (
          <div className="bg-white dark:bg-[#0f172a]/90 border border-gray-200 dark:border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
            <h3 className="font-bold text-base text-gray-900 dark:text-white">Bank Account Details</h3>

            {/* Bank Selector Trigger */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Select Bank / Institution
              </label>
              <button
                type="button"
                onClick={() => setShowBankModal(true)}
                disabled={loadingBanks}
                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-[#1e1b4b]/40 border border-gray-200 dark:border-purple-500/20 flex items-center justify-between hover:border-purple-400 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <Building2 size={20} className="text-purple-600 dark:text-purple-400" />
                  <span className="font-bold text-sm text-gray-900 dark:text-white">
                    {loadingBanks ? 'Loading real bank directory...' : selectedBank?.name || 'Select Bank'}
                  </span>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
            </div>

            {/* Account Number Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                10-Digit Account Number
              </label>
              <div className="relative">
                <input
                  ref={accountInputRef}
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="0123456789"
                  value={accountNumber}
                  onChange={(e) => handleAccountNumChange(e.target.value)}
                  onBlur={handleAccountNumberBlur}
                  className="w-full p-4 pr-12 rounded-2xl bg-gray-50 dark:bg-[#1e1b4b]/40 border border-gray-200 dark:border-purple-500/20 text-gray-900 dark:text-white font-mono font-bold text-lg focus:outline-none focus:border-purple-500 transition-colors"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {isVerifying ? (
                    <Loader2 size={20} className="animate-spin text-purple-600" />
                  ) : (isVerified && accountName) ? (
                    <CheckCircle2 size={22} className="text-emerald-500" />
                  ) : null}
                </div>
              </div>
            </div>

            {/* Fix 2: Display Real Account Name Prominently with Confirmation */}
            {isVerified && accountName && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-3xl bg-emerald-50/80 dark:bg-emerald-950/30 border-2 border-emerald-500/40 dark:border-emerald-500/30 shadow-lg space-y-4"
              >
                {/* Header Badge */}
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                  <span>ACCOUNT VERIFIED VIA MONNIFY</span>
                </div>

                {/* Account Details Box */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Account Holder:</p>
                    <button
                      type="button"
                      onClick={() => setIsEditingName(!isEditingName)}
                      className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer"
                    >
                      {isEditingName ? 'Done' : 'Edit Name'}
                    </button>
                  </div>
                  {isEditingName ? (
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                      className="w-full p-2.5 rounded-xl border border-purple-300 dark:border-purple-600 font-mono font-bold text-base bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white uppercase focus:outline-none focus:border-purple-500"
                    />
                  ) : (
                    <p className="text-lg sm:text-xl font-black text-gray-900 dark:text-white font-mono tracking-wide">
                      {accountName}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {selectedBank?.name} · {accountNumber}
                  </p>
                </div>

                {/* Confirmation Prompt */}
                {!userConfirmedName ? (
                  <div className="pt-1 space-y-3">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      Is this your correct account holder name?
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleConfirmName}
                        disabled={isSaving}
                        className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Check size={14} strokeWidth={3} />
                            <span>Yes, continue</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUserConfirmedName(false);
                          setIsVerified(false);
                          setAccountName('');
                          accountInputRef.current?.focus();
                        }}
                        className="flex-1 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-semibold text-xs transition-all cursor-pointer"
                      >
                        No, edit account number
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                      <Check size={16} strokeWidth={3} />
                      <span>Name confirmed by you</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUserConfirmedName(false)}
                      className="text-purple-600 dark:text-purple-400 hover:underline text-xs font-semibold cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Verification Error */}
            {verificationError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2.5">
                <AlertCircle size={18} className="shrink-0 text-rose-600 dark:text-rose-400" />
                <span className="font-medium">{verificationError}</span>
              </div>
            )}

            {/* Continue CTA (Disabled until all conditions met) */}
            <motion.button
              whileHover={{ scale: canSave ? 1.01 : 1 }}
              whileTap={{ scale: canSave ? 0.98 : 1 }}
              onClick={handleContinueWithNew}
              disabled={!canSave}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#8B5CF6] via-indigo-600 to-[#7C3AED] hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-base shadow-xl shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-4"
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Saving Account...</span>
                </>
              ) : (
                <>
                  <span>SAVE & CONTINUE</span>
                  <span>→</span>
                </>
              )}
            </motion.button>
          </div>
        )}

      </PageTransition>

      {/* Bank Selection Modal */}
      <AnimatePresence>
        {showBankModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-gray-900 dark:text-white">Select Bank ({banksList.length})</h3>
                <button
                  onClick={() => setShowBankModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Search Bank */}
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bank name or code..."
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Bank List */}
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {filteredBanks.map((b) => {
                  const isSelected = selectedBank?.code === b.code;
                  return (
                    <button
                      key={b.code}
                      onClick={() => handleBankSelect(b)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left ${
                        isSelected
                          ? 'bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800'
                          : 'hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                      }`}
                    >
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">{b.name}</span>
                      <span className="text-xs font-mono text-gray-400">{b.code}</span>
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
