import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { merchantSettingsApi, MerchantSettlementSettings } from '@/services/api/merchantSettingsApi';
import { merchantSettlementsApi, SettlementDetail } from '@/services/api/merchantSettlementsApi';
import { payoutApi, BankAccountItem } from '@/services/api/payoutApi';

export interface PayoutAccount {
  id: string;
  bankName: string;
  provider: string;
  accountNumber: string;
  accountName: string;
  country: string;
  currency: string;
  isDefault: boolean;
  isVerified: boolean;
}

export interface IncludedPayment {
  id: string;
  cryptoAmount: string;
  fiatAmount: string;
  customer: string;
  date: string;
}

export interface SettlementRecord {
  id: string;
  date: string;
  fiatAmount: string;
  fiatCurrency: string;
  cryptoReceived: string;
  rate: string;
  provider: string;
  destinationAccount: string;
  recipientName: string;
  status: 'Completed' | 'Processing' | 'Pending' | 'Failed';
  fluxPayFee: string;
  networkFee: string;
  netToBank: string;
  reference: string;
  settledDate: string;
  includedPayments: IncludedPayment[];
}

export interface SettlementSummary {
  pendingAmount: string;
  thisMonthAmount: string;
  totalAmount: string;
  currency: string;
}

interface MerchantSettlementContextType {
  settlementType: 'FIAT' | 'CRYPTO';
  setSettlementType: (type: 'FIAT' | 'CRYPTO') => void;
  currency: string;
  setCurrency: (curr: string) => void;
  payoutAccounts: PayoutAccount[];
  selectedAccountId: string;
  setSelectedAccountId: (id: string) => void;
  selectedAccount: PayoutAccount | undefined;
  addPayoutAccount: (account: Omit<PayoutAccount, 'id' | 'isVerified'>) => Promise<PayoutAccount>;
  updatePayoutAccount: (id: string, updates: Partial<PayoutAccount>) => Promise<void>;
  removePayoutAccount: (id: string) => Promise<void>;
  setDefaultPayoutAccount: (id: string) => Promise<void>;
  settlements: SettlementRecord[];
  summary: SettlementSummary;
  getSettlement: (id: string) => SettlementRecord | undefined;
  refreshSettlements: () => Promise<void>;
  triggerManualSettlement: () => Promise<any>;
}

const MerchantSettlementContext = createContext<MerchantSettlementContextType | null>(null);

function mapBackendAccount(b: BankAccountItem): PayoutAccount {
  return {
    id: b.id,
    bankName: b.bankName,
    provider: b.bankName.toLowerCase().includes('opay') ? 'OPay' : 'Bank Transfer',
    accountNumber: b.accountNumber,
    accountName: b.accountName,
    country: b.country || 'Nigeria',
    currency: b.currency || 'NGN',
    isDefault: !!b.isDefault,
    isVerified: !!b.isVerified,
  };
}

function mapBackendSettlement(s: SettlementDetail): SettlementRecord {
  const sym = s.currency === 'USD' ? '$' : s.currency === 'EUR' ? '€' : '₦';
  const statusFormatted: SettlementRecord['status'] =
    s.status === 'COMPLETED'
      ? 'Completed'
      : s.status === 'FAILED'
      ? 'Failed'
      : s.status === 'PROCESSING'
      ? 'Processing'
      : 'Pending';

  const bankName = s.bankAccount?.bankName || 'Bank Account';
  const accNum = s.bankAccount?.accountNumber || '';
  const accHolder = s.bankAccount?.accountName || 'FluxPay Merchant';

  const payments: IncludedPayment[] = Array.isArray(s.payments)
    ? s.payments.map((p, idx) => ({
        id: p.id || `ORD-${idx + 1}`,
        cryptoAmount: `${p.amount || '0'} SOL`,
        fiatAmount: `${sym}${Number(p.fiatAmount || p.amount || 0).toLocaleString()}`,
        customer: p.customerWallet ? `${p.customerWallet.slice(0, 4)}...${p.customerWallet.slice(-4)}` : 'Customer',
        date: p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Recent',
      }))
    : [];

  const createdDate = s.createdAt
    ? new Date(s.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Recent';
  const settledDate = s.settledAt
    ? new Date(s.settledAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : createdDate;

  return {
    id: s.id,
    date: createdDate,
    fiatAmount: `${sym}${Number(s.grossAmount || s.fiatAmount || 0).toLocaleString()}`,
    fiatCurrency: s.currency || 'NGN',
    cryptoReceived: `${s.paymentCount || 1} payment(s)`,
    rate: s.fxRate ? `1 SOL ≈ ${sym}${Number(s.fxRate).toLocaleString()}` : '',
    provider: s.provider || 'Bank Transfer',
    destinationAccount: `${bankName} · ${accNum}`,
    recipientName: accHolder,
    status: statusFormatted,
    fluxPayFee: `${sym}${Number(s.fee || 0).toLocaleString()}`,
    networkFee: `${sym}${Number(s.networkFee || 0).toLocaleString()}`,
    netToBank: `${sym}${Number(s.netAmount || 0).toLocaleString()}`,
    reference: s.providerRefId || s.id,
    settledDate: settledDate,
    includedPayments: payments,
  };
}

export function MerchantSettlementProvider({ children }: { children: React.ReactNode }) {
  const [settlementType, setSettlementTypeState] = useState<'FIAT' | 'CRYPTO'>('FIAT');
  const [currency, setCurrencyState] = useState<string>('NGN');
  const [payoutAccounts, setPayoutAccounts] = useState<PayoutAccount[]>([]);
  const [selectedAccountId, setSelectedAccountIdState] = useState<string>('');
  const [settlements, setSettlements] = useState<SettlementRecord[]>([]);

  // Load settlements from API
  const refreshSettlements = useCallback(async () => {
    try {
      const res = await merchantSettlementsApi.list();
      if (res && Array.isArray(res.settlements)) {
        setSettlements(res.settlements.map(mapBackendSettlement));
      }
    } catch (err) {
      console.warn('[MerchantSettlementContext] Could not load settlements:', err);
    }
  }, []);

  // Load accounts from API
  const refreshAccounts = useCallback(async () => {
    try {
      const res = await payoutApi.listAccounts();
      if (res && Array.isArray(res.accounts)) {
        const mapped = res.accounts.map(mapBackendAccount);
        setPayoutAccounts(mapped);
        if (mapped.length > 0 && !selectedAccountId) {
          const def = mapped.find((a) => a.isDefault) || mapped[0];
          setSelectedAccountIdState(def.id);
        }
      }
    } catch (err) {
      console.warn('[MerchantSettlementContext] Could not load payout accounts:', err);
    }
  }, [selectedAccountId]);

  // Load settings on mount
  useEffect(() => {
    let mounted = true;

    // 1. Fetch settings
    merchantSettingsApi
      .getSettings()
      .then((settings) => {
        if (!mounted || !settings) return;
        if (settings.settlementType) {
          setSettlementTypeState(settings.settlementType);
        }
        if (settings.settlementCurrency) {
          setCurrencyState(settings.settlementCurrency);
        }
        if (settings.defaultPayoutAccountId) {
          setSelectedAccountIdState(settings.defaultPayoutAccountId);
        }
      })
      .catch((err) => {
        console.warn('[MerchantSettlementContext] Could not load settlement settings:', err);
      });

    // 2. Fetch accounts & settlements
    refreshAccounts();
    refreshSettlements();

    return () => {
      mounted = false;
    };
  }, [refreshAccounts, refreshSettlements]);

  const setSettlementType = (type: 'FIAT' | 'CRYPTO') => {
    setSettlementTypeState(type);
    merchantSettingsApi.updateSettings({ settlementType: type }).catch((err) => {
      console.warn('[MerchantSettlementContext] Failed to persist settlementType:', err);
    });
  };

  const setCurrency = (curr: string) => {
    setCurrencyState(curr);
    merchantSettingsApi.updateSettings({ settlementCurrency: curr }).catch((err) => {
      console.warn('[MerchantSettlementContext] Failed to persist settlementCurrency:', err);
    });
  };

  const setSelectedAccountId = (id: string) => {
    setSelectedAccountIdState(id);
    merchantSettingsApi.updateSettings({ defaultPayoutAccountId: id }).catch((err) => {
      console.warn('[MerchantSettlementContext] Failed to persist defaultPayoutAccountId:', err);
    });
  };

  const addPayoutAccount = async (accountData: Omit<PayoutAccount, 'id' | 'isVerified'>) => {
    try {
      const created = await payoutApi.addAccount({
        bankName: accountData.bankName,
        accountNumber: accountData.accountNumber,
        accountName: accountData.accountName,
        currency: accountData.currency || currency,
        setDefault: !!accountData.isDefault,
      });
      const mapped = mapBackendAccount(created);
      setPayoutAccounts((prev) => [mapped, ...prev]);
      if (mapped.isDefault) {
        setSelectedAccountId(mapped.id);
      }
      return mapped;
    } catch (err) {
      console.error('[MerchantSettlementContext] addAccount API failed:', err);
      throw err;
    }
  };

  const updatePayoutAccount = async (id: string, updates: Partial<PayoutAccount>) => {
    setPayoutAccounts((prev) => prev.map((acc) => (acc.id === id ? { ...acc, ...updates } : acc)));
    if (updates.isDefault) {
      try {
        await payoutApi.setDefault(id);
        setSelectedAccountId(id);
      } catch (err) {
        console.warn('[MerchantSettlementContext] setDefault API failed:', err);
      }
    }
  };

  const removePayoutAccount = async (id: string) => {
    try {
      await payoutApi.deleteAccount(id);
    } catch (err) {
      console.warn('[MerchantSettlementContext] deleteAccount API failed:', err);
    }
    const remaining = payoutAccounts.filter((acc) => acc.id !== id);
    setPayoutAccounts(remaining);
    if (selectedAccountId === id) {
      const fallback = remaining.find((a) => a.isDefault) || remaining[0];
      setSelectedAccountId(fallback ? fallback.id : '');
    }
  };

  const setDefaultPayoutAccount = async (id: string) => {
    try {
      await payoutApi.setDefault(id);
      setSelectedAccountId(id);
    } catch (err) {
      console.warn('[MerchantSettlementContext] setDefault API failed:', err);
    }
    setPayoutAccounts((prev) =>
      prev.map((acc) => ({
        ...acc,
        isDefault: acc.id === id,
      }))
    );
  };

  const triggerManualSettlement = async () => {
    const res = await merchantSettlementsApi.trigger(currency, selectedAccountId || undefined);
    await refreshSettlements();
    return res;
  };

  const selectedAccount = useMemo(() => {
    return (
      payoutAccounts.find((a) => a.id === selectedAccountId) ||
      payoutAccounts.find((a) => a.isDefault) ||
      payoutAccounts[0]
    );
  }, [payoutAccounts, selectedAccountId]);

  const getSettlement = (id: string) => {
    return settlements.find((s) => s.id === id || s.id.toLowerCase() === id?.toLowerCase());
  };

  // Compute dynamic summary metrics from real settlement data
  const summary: SettlementSummary = useMemo(() => {
    const sym = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₦';
    let pending = 0;
    let total = 0;

    for (const s of settlements) {
      const numericVal = parseFloat(s.fiatAmount.replace(/[^0-9.]/g, '')) || 0;
      if (s.status === 'Pending' || s.status === 'Processing') {
        pending += numericVal;
      }
      if (s.status === 'Completed') {
        total += numericVal;
      }
    }

    return {
      pendingAmount: `${sym}${pending.toLocaleString()}`,
      thisMonthAmount: `${sym}${total.toLocaleString()}`,
      totalAmount: `${sym}${total.toLocaleString()}`,
      currency,
    };
  }, [settlements, currency]);

  return (
    <MerchantSettlementContext.Provider
      value={{
        settlementType,
        setSettlementType,
        currency,
        setCurrency,
        payoutAccounts,
        selectedAccountId,
        setSelectedAccountId,
        selectedAccount,
        addPayoutAccount,
        updatePayoutAccount,
        removePayoutAccount,
        setDefaultPayoutAccount,
        settlements,
        summary,
        getSettlement,
        refreshSettlements,
        triggerManualSettlement,
      }}
    >
      {children}
    </MerchantSettlementContext.Provider>
  );
}

export function useMerchantSettlement() {
  const context = useContext(MerchantSettlementContext);
  if (!context) {
    return {
      settlementType: 'FIAT' as const,
      setSettlementType: () => {},
      currency: 'NGN',
      setCurrency: () => {},
      payoutAccounts: [],
      selectedAccountId: '',
      setSelectedAccountId: () => {},
      selectedAccount: undefined,
      addPayoutAccount: async () => ({
        id: '',
        bankName: '',
        provider: '',
        accountNumber: '',
        accountName: '',
        country: 'Nigeria',
        currency: 'NGN',
        isDefault: true,
        isVerified: true,
      }),
      updatePayoutAccount: async () => {},
      removePayoutAccount: async () => {},
      setDefaultPayoutAccount: async () => {},
      settlements: [],
      summary: {
        pendingAmount: '₦0',
        thisMonthAmount: '₦0',
        totalAmount: '₦0',
        currency: 'NGN',
      },
      getSettlement: () => undefined,
      refreshSettlements: async () => {},
      triggerManualSettlement: async () => {},
    };
  }
  return context;
}
