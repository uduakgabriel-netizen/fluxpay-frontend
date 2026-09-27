import React, { createContext, useContext, useState, useEffect } from 'react';

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

const INITIAL_ACCOUNTS: PayoutAccount[] = [
  {
    id: 'acc-opay-1',
    bankName: 'OPay',
    provider: 'OPay',
    accountNumber: '080XXXXXXXX',
    accountName: 'UDUAK GABRIEL AKPAN',
    country: 'Nigeria',
    currency: 'NGN',
    isDefault: true,
    isVerified: true,
  },
  {
    id: 'acc-gtb-2',
    bankName: 'Guaranty Trust Bank (GTBank)',
    provider: 'Bank Transfer',
    accountNumber: '0123456789',
    accountName: 'UDUAK GABRIEL AKPAN',
    country: 'Nigeria',
    currency: 'NGN',
    isDefault: false,
    isVerified: true,
  },
];

const INITIAL_SETTLEMENTS: SettlementRecord[] = [
  {
    id: 'SET-8X29K4L9M',
    date: '25 Sep 2026',
    fiatAmount: '₦15,230',
    fiatCurrency: 'NGN',
    cryptoReceived: '10,000 BONK',
    rate: '1 BONK = ₦1.523',
    provider: 'Breet',
    destinationAccount: 'OPay · 080XXXXXXXX',
    recipientName: 'UDUAK GABRIEL AKPAN',
    status: 'Completed',
    fluxPayFee: '₦152',
    networkFee: '₦12',
    netToBank: '₦15,066',
    reference: 'BR-8X29K4L9M',
    settledDate: '25 Sep 2026',
    includedPayments: [
      { id: 'ORD-12345', cryptoAmount: '2,000 BONK', fiatAmount: '₦3,046', customer: '0x9Bv8...whFB', date: '25 Sep 2026, 11:20' },
      { id: 'ORD-12346', cryptoAmount: '3,500 BONK', fiatAmount: '₦5,330', customer: '0x4Kx2...mN9P', date: '25 Sep 2026, 12:45' },
      { id: 'ORD-12347', cryptoAmount: '4,500 BONK', fiatAmount: '₦6,854', customer: '0x7Ht5...pQ3R', date: '25 Sep 2026, 14:10' },
    ],
  },
  {
    id: 'SET-7M910K32',
    date: '24 Sep 2026',
    fiatAmount: '₦445,728',
    fiatCurrency: 'NGN',
    cryptoReceived: '1.5 SOL',
    rate: '1 SOL ≈ ₦300,153',
    provider: 'Breet',
    destinationAccount: 'GTBank · 0123456789',
    recipientName: 'UDUAK GABRIEL AKPAN',
    status: 'Completed',
    fluxPayFee: '₦4,457',
    networkFee: '₦12',
    netToBank: '₦441,259',
    reference: 'BR-771923055',
    settledDate: '24 Sep 2026',
    includedPayments: [
      { id: 'ORD-12330', cryptoAmount: '0.5 SOL', fiatAmount: '₦148,576', customer: '0x2Ws6...vX8Y', date: '24 Sep 2026, 09:12' },
      { id: 'ORD-12331', cryptoAmount: '1.0 SOL', fiatAmount: '₦297,152', customer: '0x6Lm1...kJ4H', date: '24 Sep 2026, 16:30' },
    ],
  },
  {
    id: 'SET-6B431L88',
    date: '23 Sep 2026',
    fiatAmount: '₦380,000',
    fiatCurrency: 'NGN',
    cryptoReceived: '250 USDC',
    rate: '1 USDC = ₦1,535',
    provider: 'Breet',
    destinationAccount: 'OPay · 080XXXXXXXX',
    recipientName: 'UDUAK GABRIEL AKPAN',
    status: 'Processing',
    fluxPayFee: '₦3,800',
    networkFee: '₦12',
    netToBank: '₦376,188',
    reference: 'BR-665109210',
    settledDate: '23 Sep 2026',
    includedPayments: [
      { id: 'ORD-12320', cryptoAmount: '100 USDC', fiatAmount: '₦152,000', customer: '0x1A2b...8F2B', date: '23 Sep 2026, 10:15' },
      { id: 'ORD-12321', cryptoAmount: '150 USDC', fiatAmount: '₦228,000', customer: '0x8C4d...3D1E', date: '23 Sep 2026, 17:05' },
    ],
  },
  {
    id: 'SET-5Y882V14',
    date: '22 Sep 2026',
    fiatAmount: '₦484,500',
    fiatCurrency: 'NGN',
    cryptoReceived: '300 USDT',
    rate: '1 USDT = ₦1,615',
    provider: 'Breet',
    destinationAccount: 'OPay · 080XXXXXXXX',
    recipientName: 'UDUAK GABRIEL AKPAN',
    status: 'Completed',
    fluxPayFee: '₦4,845',
    networkFee: '₦12',
    netToBank: '₦479,643',
    reference: 'BR-554192088',
    settledDate: '22 Sep 2026',
    includedPayments: [
      { id: 'ORD-12310', cryptoAmount: '150 USDT', fiatAmount: '₦242,250', customer: '0x4E5f...9A2C', date: '22 Sep 2026, 08:30' },
      { id: 'ORD-12311', cryptoAmount: '150 USDT', fiatAmount: '₦242,250', customer: '0x9F0a...1B4D', date: '22 Sep 2026, 14:22' },
    ],
  },
  {
    id: 'SET-4X112A09',
    date: '21 Sep 2026',
    fiatAmount: '₦2,300',
    fiatCurrency: 'NGN',
    cryptoReceived: '5 JUP',
    rate: '1 JUP = ₦464.6',
    provider: 'Breet',
    destinationAccount: 'Bank Account · 2012938471',
    recipientName: 'UDUAK GABRIEL AKPAN',
    status: 'Failed',
    fluxPayFee: '₦23',
    networkFee: '₦12',
    netToBank: '₦2,265',
    reference: 'BR-443918274',
    settledDate: '21 Sep 2026',
    includedPayments: [
      { id: 'ORD-12301', cryptoAmount: '5 JUP', fiatAmount: '₦2,300', customer: '0x3D7e...7C8A', date: '21 Sep 2026, 13:40' },
    ],
  },
];

interface MerchantSettlementContextType {
  settlementType: 'FIAT' | 'CRYPTO';
  setSettlementType: (type: 'FIAT' | 'CRYPTO') => void;
  currency: string;
  setCurrency: (curr: string) => void;
  payoutAccounts: PayoutAccount[];
  selectedAccountId: string;
  setSelectedAccountId: (id: string) => void;
  selectedAccount: PayoutAccount | undefined;
  addPayoutAccount: (account: Omit<PayoutAccount, 'id' | 'isVerified'>) => PayoutAccount;
  updatePayoutAccount: (id: string, updates: Partial<PayoutAccount>) => void;
  removePayoutAccount: (id: string) => void;
  setDefaultPayoutAccount: (id: string) => void;
  settlements: SettlementRecord[];
  summary: SettlementSummary;
  getSettlement: (id: string) => SettlementRecord | undefined;
}

const MerchantSettlementContext = createContext<MerchantSettlementContextType | null>(null);

const STORAGE_KEYS = {
  PREF: 'fluxpay_merchant_settlement_pref',
  CURRENCY: 'fluxpay_merchant_settlement_currency',
  ACCOUNTS: 'fluxpay_merchant_payout_accounts',
  SELECTED_ACCOUNT: 'fluxpay_merchant_selected_account_id',
};

export function MerchantSettlementProvider({ children }: { children: React.ReactNode }) {
  const [settlementType, setSettlementTypeState] = useState<'FIAT' | 'CRYPTO'>('FIAT');
  const [currency, setCurrencyState] = useState<string>('NGN');
  const [payoutAccounts, setPayoutAccounts] = useState<PayoutAccount[]>(INITIAL_ACCOUNTS);
  const [selectedAccountId, setSelectedAccountIdState] = useState<string>('acc-opay-1');
  const [settlements] = useState<SettlementRecord[]>(INITIAL_SETTLEMENTS);

  // Initialize from localStorage if present
  useEffect(() => {
    try {
      const savedPref = localStorage.getItem(STORAGE_KEYS.PREF);
      if (savedPref === 'FIAT' || savedPref === 'CRYPTO') {
        setSettlementTypeState(savedPref);
      }
      const savedCurr = localStorage.getItem(STORAGE_KEYS.CURRENCY);
      if (savedCurr) {
        setCurrencyState(savedCurr);
      }
      const savedAccounts = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (savedAccounts) {
        const parsed = JSON.parse(savedAccounts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPayoutAccounts(parsed);
        }
      }
      const savedAccId = localStorage.getItem(STORAGE_KEYS.SELECTED_ACCOUNT);
      if (savedAccId) {
        setSelectedAccountIdState(savedAccId);
      }
    } catch (e) {
      console.warn('Could not restore merchant settlement state:', e);
    }
  }, []);

  const setSettlementType = (type: 'FIAT' | 'CRYPTO') => {
    setSettlementTypeState(type);
    try {
      localStorage.setItem(STORAGE_KEYS.PREF, type);
    } catch {}
  };

  const setCurrency = (curr: string) => {
    setCurrencyState(curr);
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, curr);
    } catch {}
  };

  const setSelectedAccountId = (id: string) => {
    setSelectedAccountIdState(id);
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_ACCOUNT, id);
    } catch {}
  };

  const saveAccountsToStorage = (accs: PayoutAccount[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accs));
    } catch {}
  };

  const addPayoutAccount = (accountData: Omit<PayoutAccount, 'id' | 'isVerified'>) => {
    const newId = `acc-${Date.now().toString(36)}`;
    const isFirst = payoutAccounts.length === 0;
    const newAccount: PayoutAccount = {
      ...accountData,
      id: newId,
      isVerified: true,
      isDefault: accountData.isDefault || isFirst,
    };

    let updated = [newAccount, ...payoutAccounts];
    if (newAccount.isDefault) {
      updated = updated.map((acc) => (acc.id === newId ? acc : { ...acc, isDefault: false }));
      setSelectedAccountId(newId);
    }

    setPayoutAccounts(updated);
    saveAccountsToStorage(updated);
    return newAccount;
  };

  const updatePayoutAccount = (id: string, updates: Partial<PayoutAccount>) => {
    let updated = payoutAccounts.map((acc) => (acc.id === id ? { ...acc, ...updates } : acc));
    if (updates.isDefault) {
      updated = updated.map((acc) => (acc.id === id ? { ...acc, isDefault: true } : { ...acc, isDefault: false }));
    }
    setPayoutAccounts(updated);
    saveAccountsToStorage(updated);
  };

  const removePayoutAccount = (id: string) => {
    const remaining = payoutAccounts.filter((acc) => acc.id !== id);
    if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
      remaining[0].isDefault = true;
    }
    setPayoutAccounts(remaining);
    saveAccountsToStorage(remaining);

    if (selectedAccountId === id) {
      const fallback = remaining.find((a) => a.isDefault) || remaining[0];
      setSelectedAccountId(fallback ? fallback.id : '');
    }
  };

  const setDefaultPayoutAccount = (id: string) => {
    const updated = payoutAccounts.map((acc) => ({
      ...acc,
      isDefault: acc.id === id,
    }));
    setPayoutAccounts(updated);
    saveAccountsToStorage(updated);
    setSelectedAccountId(id);
  };

  const selectedAccount = payoutAccounts.find((a) => a.id === selectedAccountId) || payoutAccounts.find((a) => a.isDefault) || payoutAccounts[0];

  const getSettlement = (id: string) => {
    return settlements.find((s) => s.id === id || s.id.toLowerCase() === id?.toLowerCase());
  };

  const summary: SettlementSummary = {
    pendingAmount: '₦0',
    thisMonthAmount: '₦1,245,320',
    totalAmount: '₦5,230,000',
    currency: 'NGN',
  };

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
      }}
    >
      {children}
    </MerchantSettlementContext.Provider>
  );
}

export function useMerchantSettlement() {
  const context = useContext(MerchantSettlementContext);
  if (!context) {
    // Fallback during SSR or testing
    return {
      settlementType: 'FIAT' as const,
      setSettlementType: () => {},
      currency: 'NGN',
      setCurrency: () => {},
      payoutAccounts: INITIAL_ACCOUNTS,
      selectedAccountId: 'acc-opay-1',
      setSelectedAccountId: () => {},
      selectedAccount: INITIAL_ACCOUNTS[0],
      addPayoutAccount: () => INITIAL_ACCOUNTS[0],
      updatePayoutAccount: () => {},
      removePayoutAccount: () => {},
      setDefaultPayoutAccount: () => {},
      settlements: INITIAL_SETTLEMENTS,
      summary: {
        pendingAmount: '₦0',
        thisMonthAmount: '₦1,245,320',
        totalAmount: '₦5,230,000',
        currency: 'NGN',
      },
      getSettlement: (id: string) => INITIAL_SETTLEMENTS.find((s) => s.id === id),
    };
  }
  return context;
}
