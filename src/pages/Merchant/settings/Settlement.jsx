import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  CheckCircle2,
  ChevronRight,
  Building2,
  Save,
  AlertCircle,
  Coins,
  Wallet,
  Copy,
  Check,
} from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import DashboardLayout from '@/components/dashboard/layout';
import PageTransition from '@/components/shared/PageTransition';
import SettlementPreferenceCard from '@/components/settlements/SettlementPreferenceCard';
import BankAccountCard from '@/components/settlements/BankAccountCard';
import AddBankAccountModal from '@/components/settlements/AddBankAccountModal';
import Skeleton from '@/components/shared/Skeleton';
import { useMerchantSettlement } from '@/contexts/MerchantSettlementContext';
import { merchantSettingsApi } from '@/services/api/merchantSettingsApi';
import apiClient from '@/services/api/client';
import { useToast } from '@/components/shared/Toast';

const CURRENCIES = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira (NGN ₦)' },
  { code: 'USD', symbol: '$', name: 'US Dollar (USD $)' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR €)' },
];

const DEFAULT_TOKENS = [
  { symbol: 'USDC', name: 'USD Coin' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'USDT', name: 'Tether USD' },
  { symbol: 'BONK', name: 'Bonk' },
  { symbol: 'JUP', name: 'Jupiter' },
];

export default function SettlementPreferencePage() {
  const router = useRouter();
  const toast = useToast();
  const { publicKey } = useWallet();
  const {
    settlementType,
    setSettlementType,
    currency,
    setCurrency,
    payoutAccounts,
    selectedAccount,
    setSelectedAccountId,
    addPayoutAccount,
  } = useMerchantSettlement();

  const [localType, setLocalType] = useState(settlementType);
  const [localCurrency, setLocalCurrency] = useState(currency);
  const [preferredToken, setPreferredToken] = useState('USDC');
  const [sellableTokens, setSellableTokens] = useState(DEFAULT_TOKENS);
  const [savedWalletAddress, setSavedWalletAddress] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedWallet, setCopiedWallet] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Load merchant settings
    merchantSettingsApi
      .getSettings()
      .then((settings) => {
        if (!mounted || !settings) return;
        if (settings.settlementType) {
          setLocalType(settings.settlementType);
        }
        if (settings.settlementCurrency) {
          setLocalCurrency(settings.settlementCurrency);
        }
        if (settings.preferredToken) {
          setPreferredToken(settings.preferredToken);
        }
        if (settings.walletAddress) {
          setSavedWalletAddress(settings.walletAddress);
        }
      })
      .catch((err) => {
        console.warn('Failed to load settings:', err);
      });

    // Load sellable tokens from /api/assets/sellable
    apiClient
      .get('/assets/sellable')
      .then((res) => {
        if (!mounted) return;
        const tokens = res.data?.tokens;
        if (Array.isArray(tokens) && tokens.length > 0) {
          setSellableTokens(tokens);
        }
      })
      .catch((err) => {
        console.warn('Failed to load sellable tokens:', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const activeWalletAddress = publicKey?.toBase58() || savedWalletAddress || 'Connect wallet to view';

  const handleCopyWallet = () => {
    if (!activeWalletAddress || activeWalletAddress.includes('Connect')) return;
    navigator.clipboard.writeText(activeWalletAddress);
    setCopiedWallet(true);
    toast.success('Wallet address copied to clipboard');
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (localType === 'FIAT') {
        if (!selectedAccount?.id) {
          toast.error('Please select or add a payout bank account for fiat settlement');
          setSaving(false);
          return;
        }

        await merchantSettingsApi.updateSettings({
          settlementType: 'FIAT',
          settlementCurrency: localCurrency,
          defaultPayoutAccountId: selectedAccount.id,
        });
        setSettlementType('FIAT');
        setCurrency(localCurrency);
      } else {
        await merchantSettingsApi.updateSettings({
          settlementType: 'CRYPTO',
          preferredToken,
        });
        setSettlementType('CRYPTO');
      }

      toast.success('Settlement preference saved successfully!');
    } catch (err) {
      toast.error(err?.message || 'Failed to save settlement preference');
    } finally {
      setSaving(false);
    }
  };

  const handleAddNewAccount = async (newAcc) => {
    try {
      const created = await addPayoutAccount(newAcc);
      if (created?.id) {
        setSelectedAccountId(created.id);
        toast.success(`Account added: ${created.accountName}`);
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to add payout account';
      toast.error(msg);
    }
  };

  return (
    <DashboardLayout pageTitle="Settlement Preference">
      <PageTransition className="space-y-6 max-w-3xl">
        {/* Top Header with Back Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/settings"
            className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Settlement Preference
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Choose how you want customer payments settled to your business
            </p>
          </div>
        </div>

        {/* Question & Radio Preference Cards */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-slate-900 dark:text-white">
            How do you want to receive payments?
          </label>

          {loading ? (
            <div className="space-y-3">
              <Skeleton variant="rectangular" height="90px" className="rounded-2xl" />
              <Skeleton variant="rectangular" height="90px" className="rounded-2xl" />
            </div>
          ) : (
            <div className="space-y-3">
              <SettlementPreferenceCard
                type="Crypto"
                title="Crypto"
                description="Receive USDC, SOL, or your preferred token directly in your wallet."
                selected={localType === 'CRYPTO'}
                onSelect={() => setLocalType('CRYPTO')}
              />

              <SettlementPreferenceCard
                type="Fiat"
                title="Fiat"
                description="Receive NGN, USD, or EUR directly in your bank account."
                selected={localType === 'FIAT'}
                onSelect={() => setLocalType('FIAT')}
              />
            </div>
          )}
        </div>

        {/* Crypto Specific Configuration */}
        <AnimatePresence>
          {localType === 'CRYPTO' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 pt-4 border-t border-slate-200 dark:border-white/[0.08]"
            >
              {/* Preferred Crypto Token */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Preferred Settlement Token
                </label>
                <div className="relative max-w-sm">
                  <select
                    value={preferredToken}
                    onChange={(e) => setPreferredToken(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-purple-500/20 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-[#8B5CF6] transition-colors cursor-pointer shadow-sm"
                  >
                    {sellableTokens.map((t) => (
                      <option key={t.symbol} value={t.symbol} className="dark:bg-slate-900">
                        {t.name} ({t.symbol})
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  Payments received in other tokens will be automatically converted to {preferredToken} before delivery.
                </p>
              </div>

              {/* Connected Merchant Wallet */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Payout Wallet Address (Read-Only)
                </label>
                <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-purple-500/20 shadow-md flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] shrink-0">
                      <Wallet size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Solana Settlement Destination</p>
                      <p className="font-mono text-sm font-bold text-slate-900 dark:text-white truncate">
                        {activeWalletAddress}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyWallet}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors shrink-0"
                    title="Copy wallet address"
                  >
                    {copiedWallet ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fiat Specific Configuration */}
        <AnimatePresence>
          {localType === 'FIAT' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 pt-4 border-t border-slate-200 dark:border-white/[0.08]"
            >
              {/* Settlement Currency */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Settlement Currency
                </label>
                <div className="relative max-w-xs">
                  <select
                    value={localCurrency}
                    onChange={(e) => setLocalCurrency(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-purple-500/20 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-[#8B5CF6] transition-colors cursor-pointer shadow-sm"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code} className="dark:bg-slate-900">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Payout Account */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Payout Account
                  </label>
                  <Link
                    href="/dashboard/settings/payout-accounts"
                    className="text-xs font-semibold text-[#8B5CF6] hover:underline"
                  >
                    Manage all accounts
                  </Link>
                </div>

                {selectedAccount ? (
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-purple-500/20 shadow-md shadow-purple-500/5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] shrink-0">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{selectedAccount.bankName}</span>
                            <span className="text-slate-400 font-mono font-normal">·</span>
                            <span className="font-mono text-slate-600 dark:text-slate-300">
                              {selectedAccount.accountNumber}
                            </span>
                            <span className="text-slate-400 font-mono font-normal">·</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              {selectedAccount.accountName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 size={12} />
                              Verified
                            </span>
                            {selectedAccount.isDefault && (
                              <span className="text-[10px] text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsChangeModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                      >
                        Change Account
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-xs font-bold text-[#8B5CF6] border border-[#8B5CF6]/30 transition-colors cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Add New</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
                    <div className="flex items-center justify-center text-amber-500 gap-1.5 text-xs font-medium">
                      <AlertCircle size={16} />
                      <span>No payout bank account configured for fiat settlement</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>+ Add Payout Account</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save Button */}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white text-sm font-bold shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'SAVE PREFERENCE'}</span>
          </button>
        </div>

        {/* Change Account Modal */}
        <AnimatePresence>
          {isChangeModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-purple-500/20 shadow-2xl p-6 space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Select Payout Account
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsChangeModalOpen(false)}
                    className="p-1 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {payoutAccounts.map((acc) => (
                    <BankAccountCard
                      key={acc.id}
                      account={acc}
                      compact={true}
                      selected={selectedAccount?.id === acc.id}
                      onSelect={(item) => {
                        setSelectedAccountId(item.id);
                        setIsChangeModalOpen(false);
                        toast.info(`Active account changed to ${item.bankName}`);
                      }}
                    />
                  ))}
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangeModalOpen(false);
                      setIsAddModalOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl border border-dashed border-[#8B5CF6]/50 text-[#8B5CF6] text-xs font-bold hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
                  >
                    + Add Another Account
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Add Payout Account Modal */}
        <AddBankAccountModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddNewAccount}
        />
      </PageTransition>
    </DashboardLayout>
  );
}
