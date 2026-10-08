import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useConsumer } from '@/contexts/ConsumerContext';
import ConsumerLayout from '@/components/Consumer/ConsumerLayout';
import PageTransition from '@/components/shared/PageTransition';
import { payoutApi } from '@/services/api/payoutApi';
import { useToast } from '@/components/shared/Toast';

export default function PayoutAccount() {
  const router = useRouter();
  const { setPayoutDetails, bankAccounts, addBankAccount } = useConsumer();
  const toast = useToast();

  const [banksList, setBanksList] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoadingBanks(true);
    payoutApi
      .listBanks('NGN')
      .then((res) => {
        if (!mounted) return;
        if (res && Array.isArray(res.banks) && res.banks.length > 0) {
          const mapped = res.banks.map((b) => ({
            id: b.code,
            code: b.code,
            name: b.name,
          }));
          setBanksList(mapped);
          if (mapped.length > 0) {
            setSelectedBank((prev) => prev || mapped[0].name);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to fetch bank list from API:', err);
        toast.error('Failed to load bank list from server');
      })
      .finally(() => {
        if (mounted) setLoadingBanks(false);
      });
    return () => {
      mounted = false;
    };
  }, [toast]);

  const displayAccounts = (bankAccounts && bankAccounts.length > 0)
    ? bankAccounts.map((a) => ({
        id: a.id,
        type: a.bankName?.toLowerCase().includes('opay') ? 'OPay' : 'Bank',
        label: a.bankName,
        number: a.accountNumber,
        holder: a.accountName,
        gradient: a.bankName?.toLowerCase().includes('opay') ? 'from-[#00B875] to-[#059669]' : 'from-[#8B5CF6] to-[#6D28D9]',
        icon: a.bankName?.toLowerCase().includes('opay') ? '🟢' : '🏦',
      }))
    : [];

  const [selectedMethodId, setSelectedMethodId] = useState(displayAccounts[0]?.id || 'new');
  const [accountNumber, setAccountNumber] = useState(displayAccounts[0]?.number || '');
  const [holderName, setHolderName] = useState(displayAccounts[0]?.holder || '');
  const [selectedBank, setSelectedBank] = useState(displayAccounts[0]?.label || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(displayAccounts.length > 0);

  const handleSelectAccount = (acc) => {
    setSelectedMethodId(acc.id);
    setSelectedBank(acc.label);
    setAccountNumber(acc.number);
    setHolderName(acc.holder);
    setIsVerified(true);
  };

  const handleAccountNumChange = async (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 10);
    setAccountNumber(clean);
    setIsVerified(false);
    setHolderName('');

    if (clean.length === 10) {
      setIsVerifying(true);
      try {
        const bankObj = banksList.find((b) => b.name === selectedBank) || banksList[0];
        const res = await payoutApi.verifyAccount({
          accountNumber: clean,
          bankCode: bankObj?.code || '',
          currency: 'NGN',
        });
        if (res?.accountName) {
          setHolderName(res.accountName);
          setIsVerified(true);
          toast.success(`Account verified: ${res.accountName}`);
        } else {
          toast.error('Account name verification failed. Please check details.');
        }
      } catch (err) {
        toast.error(err?.message || 'Verification failed. Please check account details.');
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleVerify = async () => {
    if (!accountNumber || accountNumber.length < 10) {
      toast.warning('Account number must be 10 digits');
      return;
    }
    setIsVerifying(true);
    try {
      const bankObj = banksList.find((b) => b.name === selectedBank) || banksList[0];
      const res = await payoutApi.verifyAccount({
        accountNumber,
        bankCode: bankObj?.code || '',
        currency: 'NGN',
      });
      if (res?.accountName) {
        setHolderName(res.accountName);
        setIsVerified(true);
        toast.success(`Account verified: ${res.accountName}`);
      } else {
        toast.error('Could not verify account name.');
      }
    } catch (err) {
      toast.error(err?.message || 'Account verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleContinue = async () => {
    if (!isVerified || !holderName) {
      toast.warning('Please enter and verify a bank account before continuing');
      return;
    }

    let accountId = selectedMethodId;
    if (selectedMethodId === 'new' || !accountId) {
      try {
        const bankObj = banksList.find((b) => b.name === selectedBank) || banksList[0];
        const added = await addBankAccount?.({
          bankName: selectedBank,
          bankCode: bankObj?.code || '',
          accountNumber,
          accountName: holderName,
          currency: 'NGN',
        });
        if (added?.id) accountId = added.id;
      } catch (err) {
        console.warn('Failed to add bank account:', err);
      }
    }

    setPayoutDetails({
      id: accountId,
      provider: selectedBank,
      accountNumber,
      accountName: holderName,
      verified: true,
    });
    router.push('/sell/confirm');
  };

  return (
    <ConsumerLayout title="Payment Method" backHref="/sell/quote" maxWidth="max-w-md">
      <PageTransition className="space-y-5">
        {/* Horizontal Cards Carousel */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">
            Choose Payout Account
          </span>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none">
            {/* + Add New Card Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setSelectedMethodId('new');
                setAccountNumber('');
                setHolderName('');
                setIsVerified(false);
              }}
              className={`w-16 h-28 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed transition-all flex-shrink-0 cursor-pointer ${
                selectedMethodId === 'new'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-600'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:border-slate-400'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-teal-400 font-bold text-lg mb-1">
                +
              </div>
              <span className="text-[10px] font-bold">New</span>
            </motion.button>

            {/* Saved Visual Account Cards */}
            {displayAccounts.map((acc) => {
              const isSelected = selectedMethodId === acc.id;
              return (
                <motion.div
                  key={acc.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectAccount(acc)}
                  className={`w-48 h-28 rounded-2xl p-3.5 flex flex-col justify-between flex-shrink-0 cursor-pointer transition-all border relative overflow-hidden ${
                    isSelected
                      ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-lg shadow-purple-500/10'
                      : 'border-slate-200 dark:border-slate-700 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-tr ${acc.gradient} opacity-90 -z-10`} />

                  <div className="flex items-center justify-between text-white">
                    <span className="text-lg">{acc.icon}</span>
                    <span className="text-[11px] font-bold tracking-wider">{acc.type}</span>
                  </div>

                  <div className="text-white space-y-0.5">
                    <div className="text-xs font-mono font-semibold tracking-wider">
                      {acc.number}
                    </div>
                    <div className="text-[10px] uppercase font-bold tracking-tight opacity-90 truncate">
                      {acc.holder}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-white text-purple-600 flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Payout Details Form Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-850 p-6 sm:p-7 space-y-4 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-purple-500/5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Payout Destination Details
            </h3>
            <span className="text-xs text-purple-600 dark:text-teal-400 font-semibold">
              Instant Wire (NIP)
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Account Number (10 digits)
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit NUBAN"
              value={accountNumber}
              onChange={(e) => handleAccountNumChange(e.target.value)}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold font-mono focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Destination Bank
            </label>
            <select
              value={selectedBank}
              onChange={(e) => {
                setSelectedBank(e.target.value);
                setIsVerified(false);
                setHolderName('');
              }}
              disabled={loadingBanks}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold focus:outline-none focus:border-purple-500 transition-colors"
            >
              {banksList.map((b) => (
                <option key={b.code} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Account Holder Name
            </label>
            <div className="relative">
              <input
                type="text"
                readOnly
                placeholder="Verified via OneLiquidity"
                value={holderName}
                className="w-full py-3.5 px-4 pr-12 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-bold font-mono text-slate-900 dark:text-white cursor-not-allowed"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {isVerifying ? (
                  <div className="w-4 h-4 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
                ) : isVerified ? (
                  <span className="text-emerald-500 font-bold text-sm">✓</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleVerify}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700"
                  >
                    Verify
                  </button>
                )}
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleContinue}
            disabled={!isVerified || !holderName}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-500 hover:to-teal-400 text-white font-bold text-sm shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 transition-all mt-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>CONTINUE TO PREVIEW</span>
            <i className="ri-arrow-right-line" />
          </motion.button>
        </div>
      </PageTransition>
    </ConsumerLayout>
  );
}
