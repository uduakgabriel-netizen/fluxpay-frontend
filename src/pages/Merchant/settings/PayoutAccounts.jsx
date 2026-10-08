import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Building2 } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/layout';
import PageTransition from '@/components/shared/PageTransition';
import BankAccountCard from '@/components/settlements/BankAccountCard';
import AddBankAccountModal from '@/components/settlements/AddBankAccountModal';
import Skeleton from '@/components/shared/Skeleton';
import EmptyState from '@/components/shared/EmptyState';
import { useMerchantSettlement } from '@/contexts/MerchantSettlementContext';
import { useToast } from '@/components/shared/Toast';

export default function PayoutAccountsPage() {
  const toast = useToast();
  const {
    payoutAccounts,
    addPayoutAccount,
    updatePayoutAccount,
    removePayoutAccount,
    setDefaultPayoutAccount,
  } = useMerchantSettlement();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (acc) => {
    setEditingAccount(acc);
    setIsModalOpen(true);
  };

  const handleSaveAccount = async (accountData) => {
    try {
      if (editingAccount) {
        await updatePayoutAccount(editingAccount.id, accountData);
        toast.success('Payout account updated');
      } else {
        await addPayoutAccount(accountData);
        toast.success('New payout account added');
      }
    } catch {
      toast.error('Failed to save account');
    }
  };

  const handleRemove = async (id) => {
    try {
      await removePayoutAccount(id);
      toast.info('Account removed');
    } catch {
      toast.error('Failed to remove account');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultPayoutAccount(id);
      toast.success('Default payout account updated');
    } catch {
      toast.error('Failed to update default account');
    }
  };

  return (
    <DashboardLayout pageTitle="Payout Accounts">
      <PageTransition className="space-y-6 max-w-3xl">
        {/* Top Navigation & Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/settings"
              className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Payout Accounts
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Manage your verified bank and digital accounts for automatic fiat settlements
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white text-xs font-bold shadow-lg shadow-purple-500/25 transition-all cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>Add Account</span>
          </button>
        </div>

        {/* Saved Accounts Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Saved Accounts
            </h3>
            <span className="text-xs text-slate-400">
              {payoutAccounts.length} account{payoutAccounts.length === 1 ? '' : 's'} linked
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton variant="circular" width="40px" height="40px" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton variant="text" width="120px" />
                      <Skeleton variant="text" width="80px" />
                    </div>
                  </div>
                  <Skeleton variant="text" width="160px" />
                </div>
              ))}
            </div>
          ) : payoutAccounts.length === 0 ? (
            <EmptyState
              type="payout"
              title="No payout accounts"
              description="No payout accounts. Add one to receive fiat."
              actionLabel="Add Account"
              onAction={handleOpenAdd}
            />
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {payoutAccounts.map((account) => (
                  <BankAccountCard
                    key={account.id}
                    account={account}
                    onSetDefault={handleSetDefault}
                    onEdit={handleOpenEdit}
                    onRemove={handleRemove}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Add Account Button (Mobile + Secondary Desktop) */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="w-full py-3.5 rounded-2xl border-2 border-dashed border-[#8B5CF6]/40 hover:border-[#8B5CF6] bg-purple-500/[0.03] hover:bg-purple-500/[0.08] text-[#8B5CF6] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
          >
            <Plus size={16} />
            <span>+ Add New Account</span>
          </button>
        </div>

        {/* Add/Edit Modal */}
        <AddBankAccountModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveAccount}
          editingAccount={editingAccount}
        />
      </PageTransition>
    </DashboardLayout>
  );
}
