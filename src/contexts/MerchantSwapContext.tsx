import React, { createContext, useContext, useState, useEffect } from 'react';

export interface SwapToken {
  symbol: string;
  name: string;
  mint: string;
  decimals?: number;
  logoURI?: string;
  iconBg?: string;
}

export interface SwapFiat {
  code: string;
  symbol: string;
  name: string;
}

export interface SwapAccount {
  id: string;
  bankName: string;
  bankCode?: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  isDefault?: boolean;
}

export interface SwapQuote {
  quoteId: string;
  sourceToken: string;
  sourceAmount: string;
  sourceMint?: string;
  intermediateToken?: string;
  intermediateAmount?: string;
  fiatCurrency: string;
  fiatAmount: string;
  rate: string;
  fee: string;
  networkFee: string;
  netAmount: string;
  expiresAt?: string;
  route?: {
    swap?: string;
    provider?: string;
    mock?: boolean;
  };
}

interface MerchantSwapContextType {
  sourceToken: SwapToken;
  setSourceToken: (token: SwapToken) => void;
  sourceAmount: string;
  setSourceAmount: (amount: string) => void;
  fiatCurrency: SwapFiat;
  setFiatCurrency: (fiat: SwapFiat) => void;
  activeQuote: SwapQuote | null;
  setActiveQuote: (quote: SwapQuote | null) => void;
  selectedAccount: SwapAccount | null;
  setSelectedAccount: (account: SwapAccount | null) => void;
  transactionId: string;
  setTransactionId: (txId: string) => void;
  resetSwapFlow: () => void;
  isHydrated: boolean;
}

const DEFAULT_TOKEN: SwapToken = {
  symbol: 'USDT',
  name: 'Tether USD',
  mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  decimals: 6,
  iconBg: 'from-[#26A17B] to-[#176249]',
};

const DEFAULT_FIAT: SwapFiat = {
  code: 'EUR',
  symbol: '€',
  name: 'Euro',
};

const STORAGE_KEY = 'fluxpay_merchant_swap_state';

const MerchantSwapContext = createContext<MerchantSwapContextType | undefined>(undefined);

export function MerchantSwapProvider({ children }: { children: React.ReactNode }) {
  const [sourceToken, setSourceToken] = useState<SwapToken>(DEFAULT_TOKEN);
  const [sourceAmount, setSourceAmount] = useState<string>('1');
  const [fiatCurrency, setFiatCurrency] = useState<SwapFiat>(DEFAULT_FIAT);
  const [activeQuote, setActiveQuote] = useState<SwapQuote | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<SwapAccount | null>(null);
  const [transactionId, setTransactionId] = useState<string>('');
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // 1. Restore from sessionStorage on client-side mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.sourceToken) setSourceToken(parsed.sourceToken);
        if (parsed.sourceAmount) setSourceAmount(parsed.sourceAmount);
        if (parsed.fiatCurrency) setFiatCurrency(parsed.fiatCurrency);
        if (parsed.activeQuote) setActiveQuote(parsed.activeQuote);
        if (parsed.selectedAccount) setSelectedAccount(parsed.selectedAccount);
        if (parsed.transactionId) setTransactionId(parsed.transactionId);
      }
    } catch (err) {
      console.warn('[MerchantSwapContext] Failed to restore swap state from sessionStorage:', err);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // 2. Persist to sessionStorage on state changes
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      const payload = {
        sourceToken,
        sourceAmount,
        fiatCurrency,
        activeQuote,
        selectedAccount,
        transactionId,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn('[MerchantSwapContext] Failed to persist swap state:', err);
    }
  }, [sourceToken, sourceAmount, fiatCurrency, activeQuote, selectedAccount, transactionId, isHydrated]);

  const resetSwapFlow = () => {
    setActiveQuote(null);
    setSelectedAccount(null);
    setTransactionId('');
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  };

  return (
    <MerchantSwapContext.Provider
      value={{
        sourceToken,
        setSourceToken,
        sourceAmount,
        setSourceAmount,
        fiatCurrency,
        setFiatCurrency,
        activeQuote,
        setActiveQuote,
        selectedAccount,
        setSelectedAccount,
        transactionId,
        setTransactionId,
        resetSwapFlow,
        isHydrated,
      }}
    >
      {children}
    </MerchantSwapContext.Provider>
  );
}

export function useMerchantSwap() {
  const context = useContext(MerchantSwapContext);
  if (!context) {
    throw new Error('useMerchantSwap must be used within a MerchantSwapProvider');
  }
  return context;
}
