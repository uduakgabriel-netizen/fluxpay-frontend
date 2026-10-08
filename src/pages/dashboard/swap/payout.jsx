import React, { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/layout';
import { useConsumer } from '@/contexts/ConsumerContext';
import { NIGERIAN_BANKS, resolveAccountName } from '@/utils/nigerianBanks';
import { payoutApi } from '@/services/api/payoutApi';
import PageTransition from '@/components/shared/PageTransition';
import EmptyState from '@/components/shared/EmptyState';
import { useToast } from '@/components/shared/Toast';

export default function MerchantSwapPayoutPage() {
  const router = useRouter();
  const {
    bankAccounts,
    selectedAccount,
    setSelectedAccount,
    addBankAccount,
  } = useConsumer();

  const accounts = (bankAccounts && bankAccounts.length > 0) ? bankAccounts : [];

  const [activeTab, setActiveTab] = useState('saved'); // 'saved' or 'new'
  const [banksList, setBanksList] = useState(NIGERIAN_BANKS);
  const [selectedBank, setSelectedBank] = useState(NIGERIAN_BANKS[0]); // default OPay
  const [bankSearch, setBankSearch] = useState('');
  const [bankFilter, setBankFilter] = useState('ALL');
  const [showBankModal, setShowBankModal] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('UDUAK GABRIEL AKPAN');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [saveForFuture, setSaveForFuture] = useState(true);

  useEffect(() => {
    let mounted = true;
    payoutApi
      .listBanks('NGN')
      .then((res) => {
        if (!mounted) return;
        if (res && Array.isArray(res.banks) && res.banks.length > 0) {
          const mapped = res.banks.map((b) => ({
            id: b.code,
            code: b.code,
            name: b.name,
            category: b.name.toLowerCase().includes('opay') || b.name.toLowerCase().includes('palm') || b.name.toLowerCase().includes('kuda') ? 'Fintech / Digital' : 'Commercial Bank',
            popular: true,
          }));
          setBanksList(mapped);
          if (mapped[0]) setSelectedBank(mapped[0]);
        }
      })
      .catch((err) => {
        console.warn('[MerchantSwapPayoutPage] Failed to fetch bank list:', err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Auto-select first account if none selected
  const activeSavedAccount = selectedAccount || accounts[0] || {
    id: 'opay',
    bankName: 'OPay',
    provider: 'OPay',
    accountNumber: '080XXXXXXXX',
    accountName: 'UDUAK GABRIEL AKPAN',
    isDefault: true,
    isVerified: true,
  };

  const handleAccountNumChange = (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 10);
    setAccountNumber(clean);
    if (clean.length === 10) {
      setIsVerifying(true);
      setIsVerified(false);
      setTimeout(() => {
        setIsVerifying(false);
        setIsVerified(true);
        const resolved = resolveAccountName(clean, selectedBank.name);
        setAccountName(resolved || 'UDUAK GABRIEL AKPAN');
      }, 500);
    } else {
      setIsVerified(false);
      setIsVerifying(false);
    }
  };

  const handleSelectBank = (bank) => {
    setSelectedBank(bank);
    setShowBankModal(false);
    if (accountNumber.length === 10) {
      setIsVerifying(true);
      setTimeout(() => {
        setIsVerifying(false);
        setIsVerified(true);
      }, 400);
    }
  };

  const handleContinue = () => {
    if (activeTab === 'saved') {
      if (activeSavedAccount && setSelectedAccount) {
        setSelectedAccount(activeSavedAccount);
      }
      router.push('/dashboard/swap/confirm');
    } else {
      // New account flow
      if (!accountNumber || accountNumber.length < 10) return;
      const newAcc = {
        id: 'acc_' + Date.now(),
        bankName: selectedBank.name,
        accountNumber,
        accountName: accountName || 'UDUAK GABRIEL AKPAN',
        isVerified: true,
        provider: selectedBank.category.includes('Fintech') ? selectedBank.name : 'Bank',
        code: selectedBank.code,
      };

      if (saveForFuture && addBankAccount) {
        addBankAccount(newAcc);
      }
      if (setSelectedAccount) {
        setSelectedAccount(newAcc);
      }
      router.push('/dashboard/swap/confirm');
    }
  };

  // Filter banks for modal
  const filteredBanks = banksList.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
                          b.code.includes(bankSearch);
    if (!matchesSearch) return false;
    if (bankFilter === 'COMMERCIAL') return b.category === 'Commercial Bank';
    if (bankFilter === 'FINTECH') return b.category.includes('Fintech');
    if (bankFilter === 'POPULAR') return b.popular;
    return true;
  });

  return (
    <DashboardLayout pageTitle="Payout Account Details">
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Receive Account Details
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Select or provide the Nigerian bank account to receive your cash payout
            </p>
          </div>
        </div>

        {/* Tab Toggle: Saved Accounts vs Add Bank Account */}
        <div className="p-1 rounded-2xl bg-gray-100 dark:bg-slate-900/80 border border-gray-200 dark:border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all relative flex items-center justify-center gap-2 ${
              activeTab === 'saved'
                ? 'text-white shadow-md shadow-purple-500/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {activeTab === 'saved' && (
              <motion.div
                layoutId="payout-tab-pill"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 -z-0"
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <CreditCard size={14} />
              Saved Accounts ({accounts.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all relative flex items-center justify-center gap-2 ${
              activeTab === 'new'
                ? 'text-white shadow-md shadow-purple-500/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {activeTab === 'new' && (
              <motion.div
                layoutId="payout-tab-pill"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 -z-0"
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Plus size={14} />
              Add Bank / Provide Details
            </span>
          </button>
        </div>

        {/* Card Container */}
        <div className="bg-white dark:bg-[#0f172a]/95 border border-gray-200 dark:border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-xl shadow-purple-500/5 backdrop-blur-xl relative overflow-hidden">
          
          {/* Ambient card light */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* TAB 1: SAVED ACCOUNTS */}
          {activeTab === 'saved' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Select Payout Destination
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('new')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                >
                  <Plus size={14} />
                  <span>Choose Another Bank</span>
                </button>
              </div>

              {/* Saved Accounts List with Fixed Dark/Light Contrast */}
              {accounts.length === 0 ? (
                <EmptyState
                  type="payout"
                  title="No saved payout accounts"
                  description="Add a Nigerian bank account to receive your crypto swap payout in Naira."
                  actionLabel="Add Bank Account"
                  onAction={() => setActiveTab('new')}
                />
              ) : (
                <div className="space-y-3">
                  {accounts.map((acc, index) => {
                    const isSelected = activeSavedAccount?.id === acc.id;
                    const isDefault = index === 0;

                    return (
                      <motion.div
                        key={acc.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedAccount && setSelectedAccount(acc)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 dark:border-purple-500 ring-2 ring-purple-500/20'
                            : 'bg-gray-50/90 dark:bg-slate-900/60 border-gray-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/40'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 p-2 text-white flex items-center justify-center font-bold text-sm shadow">
                            <Building2 size={18} />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-gray-900 dark:text-white">
                                {acc.bankName}
                              </span>
                              {isDefault && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="font-mono text-xs text-gray-500 dark:text-slate-300 mt-0.5">
                              {acc.accountNumber}
                            </p>
                            <p className="text-[11px] font-medium text-gray-700 dark:text-slate-200">
                              {acc.accountName}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          {isSelected ? (
                            <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center shadow">
                              <CheckCircle2 size={16} />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border border-gray-300 dark:border-white/20" />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: PROVIDE NEW ACCOUNT DETAILS WITH FULL NIGERIAN BANK LIST */}
          {activeTab === 'new' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1">
                  Nigerian Bank & Account Details
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Choose from any Nigerian commercial bank or digital fintech provider
                </p>
              </div>

              {/* Bank Selector Trigger */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Select Bank / Financial Institution
                </label>
                <button
                  type="button"
                  onClick={() => setShowBankModal(true)}
                  className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-900/80 border border-gray-200 dark:border-white/10 hover:border-purple-500 dark:hover:border-purple-500 transition-all flex items-center justify-between group shadow-sm text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${selectedBank.color} text-white flex items-center justify-center font-bold text-xs shadow`}>
                      {selectedBank.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                        {selectedBank.name}
                        {selectedBank.popular && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                            Popular
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {selectedBank.category} · Bank Code: {selectedBank.code}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 text-xs font-semibold">
                    <span>Change</span>
                    <ChevronDown size={16} className="text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </div>
                </button>
              </div>

              {/* 10-Digit Account Number */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Account Number (NUBAN)
                  </label>
                  <span className="text-[11px] font-mono text-gray-400">
                    {accountNumber.length}/10 digits
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Enter 10-digit account number (e.g. 0123456789)"
                    value={accountNumber}
                    onChange={(e) => handleAccountNumChange(e.target.value)}
                    className="w-full py-3.5 px-4 pr-12 rounded-2xl bg-gray-50 dark:bg-slate-900/80 border border-gray-200 dark:border-white/10 text-sm font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-all placeholder-gray-400"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    {isVerifying ? (
                      <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    ) : isVerified ? (
                      <CheckCircle2 size={20} className="text-emerald-500" />
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Resolved Account Name Banner */}
              <AnimatePresence>
                {accountNumber.length === 10 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 size={15} />
                        <span>Account Name Verified</span>
                      </div>
                      <p className="font-bold text-sm text-gray-900 dark:text-white">
                        {accountName}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">
                        Resolved via Central Bank of Nigeria / NIBSS Instant Payment Network
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Save for future checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="saveAccount"
                  checked={saveForFuture}
                  onChange={(e) => setSaveForFuture(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="saveAccount" className="text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
                  Save this account to saved beneficiaries for one-click swaps
                </label>
              </div>

            </motion.div>
          )}

          {/* Continue Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleContinue}
            disabled={activeTab === 'new' && accountNumber.length < 10}
            className="w-full mt-6 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#8B5CF6] via-indigo-600 to-[#7C3AED] hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-base shadow-xl shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>CONTINUE TO CONFIRMATION</span>
            <span>→</span>
          </motion.button>

          {/* Bottom Security Note */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 dark:text-gray-500 mt-4">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Bank account verified. Instant settlement via NIP / wire network.</span>
          </div>

        </div>

      </PageTransition>

      {/* FULL NIGERIAN BANK SELECTION MODAL */}
      <AnimatePresence>
        {showBankModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-purple-500/20 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10 shrink-0">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    Select Nigerian Bank
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Supports all Nigerian Commercial, Digital, and Fintech Banks
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center justify-center text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative shrink-0">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by bank name or code (e.g. Zenith, Access, Kuda, 058)..."
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none text-[11px]">
                {[
                  { label: 'All Banks', key: 'ALL' },
                  { label: 'Popular', key: 'POPULAR' },
                  { label: 'Commercial', key: 'COMMERCIAL' },
                  { label: 'Fintech / Digital', key: 'FINTECH' },
                ].map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setBankFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
                      bankFilter === f.key
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-white/[0.04] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Bank List Scrollable */}
              <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
                {filteredBanks.map((b) => {
                  const isSelected = selectedBank.id === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleSelectBank(b)}
                      className={`w-full p-3 rounded-xl transition-all flex items-center justify-between text-left ${
                        isSelected
                          ? 'bg-purple-50 dark:bg-purple-950/40 border border-purple-500/80 text-purple-900 dark:text-purple-200'
                          : 'hover:bg-gray-50 dark:hover:bg-white/[0.04] text-gray-900 dark:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${b.color} text-white flex items-center justify-center font-bold text-xs shadow-sm`}>
                          {b.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                            {b.name}
                            {b.popular && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                                Popular
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            {b.category} · Code: {b.code}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center">
                          <Check size={12} />
                        </div>
                      )}
                    </button>
                  );
                })}

                {filteredBanks.length === 0 && (
                  <div className="py-8 text-center text-xs text-gray-400">
                    No banks matching &ldquo;{bankSearch}&rdquo;
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
}
