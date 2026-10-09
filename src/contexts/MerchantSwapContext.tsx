import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
  sourceMint: string;
  setSourceMint: (mint: string) => void;
  fiatCurrency: SwapFiat;
  setFiatCurrency: (fiat: SwapFiat) => void;
  activeQuote: SwapQuote | null;
  setActiveQuote: (quote: SwapQuote | null) => void;
  selectedAccount: SwapAccount | null;
  setSelectedAccount: (account: SwapAccount | null) => void;
  transactionId: string;
  setTransactionId: (txId: string) => void;
  resetSwapState: () => void;
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
  code: 'NGN',
  symbol: '₦',
  name: 'Nigerian Naira',
};

const STORAGE_KEY = 'fluxpay_merchant_swap_state';

function readStoredState(): any {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

const MerchantSwapContext = createContext<MerchantSwapContextType | undefined>(undefined);

export function MerchantSwapProvider({ children }: { children: React.ReactNode }) {
  const [sourceToken, setSourceTokenState] = useState<SwapToken>(() => {
    const stored = readStoredState();
    return stored?.sourceToken || DEFAULT_TOKEN;
  });

  const [sourceAmount, setSourceAmountState] = useState<string>(() => {
    const stored = readStoredState();
    return stored?.sourceAmount || '1';
  });

  const [sourceMint, setSourceMintState] = useState<string>(() => {
    const stored = readStoredState();
    return stored?.sourceMint || stored?.sourceToken?.mint || DEFAULT_TOKEN.mint;
  });

  const [fiatCurrency, setFiatCurrencyState] = useState<SwapFiat>(() => {
    const stored = readStoredState();
    return stored?.fiatCurrency || DEFAULT_FIAT;
  });

  const [activeQuote, setActiveQuoteState] = useState<SwapQuote | null>(() => {
    const stored = readStoredState();
    return stored?.activeQuote || null;
  });

  const [selectedAccount, setSelectedAccountState] = useState<SwapAccount | null>(() => {
    const stored = readStoredState();
    return stored?.selectedAccount || null;
  });

  const [transactionId, setTransactionIdState] = useState<string>(() => {
    const stored = readStoredState();
    return stored?.transactionId || '';
  });

  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Sync state to sessionStorage helper
  const syncToStorage = useCallback((patch: Record<string, any>) => {
    if (typeof window === 'undefined') return;
    try {
      const current = readStoredState() || {};
      const updated = { ...current, ...patch };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('[MerchantSwapContext] Failed to sync state to sessionStorage:', err);
    }
  }, []);

  // Setters with immediate storage persistence
  const setSourceToken = useCallback((token: SwapToken) => {
    setSourceTokenState(token);
    setSourceMintState(token.mint);
    syncToStorage({ sourceToken: token, sourceMint: token.mint });
  }, [syncToStorage]);

  const setSourceAmount = useCallback((amount: string) => {
    setSourceAmountState(amount);
    syncToStorage({ sourceAmount: amount });
  }, [syncToStorage]);

  const setSourceMint = useCallback((mint: string) => {
    setSourceMintState(mint);
    syncToStorage({ sourceMint: mint });
  }, [syncToStorage]);

  const setFiatCurrency = useCallback((fiat: SwapFiat) => {
    setFiatCurrencyState(fiat);
    syncToStorage({ fiatCurrency: fiat });
  }, [syncToStorage]);

  const setActiveQuote = useCallback((quote: SwapQuote | null) => {
    setActiveQuoteState(quote);
    syncToStorage({ activeQuote: quote });
  }, [syncToStorage]);

  const setSelectedAccount = useCallback((account: SwapAccount | null) => {
    setSelectedAccountState(account);
    syncToStorage({ selectedAccount: account });
  }, [syncToStorage]);

  const setTransactionId = useCallback((txId: string) => {
    setTransactionIdState(txId);
    syncToStorage({ transactionId: txId });
  }, [syncToStorage]);

  // Client hydration check on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = readStoredState();
    if (stored) {
      if (stored.sourceToken) setSourceTokenState(stored.sourceToken);
      if (stored.sourceAmount) setSourceAmountState(stored.sourceAmount);
      if (stored.sourceMint) setSourceMintState(stored.sourceMint);
      if (stored.fiatCurrency) setFiatCurrencyState(stored.fiatCurrency);
      if (stored.activeQuote) setActiveQuoteState(stored.activeQuote);
      if (stored.selectedAccount) setSelectedAccountState(stored.selectedAccount);
      if (stored.transactionId) setTransactionIdState(stored.transactionId);
    }
    setIsHydrated(true);
  }, []);

  const resetSwapState = useCallback(() => {
    setActiveQuoteState(null);
    setSelectedAccountState(null);
    setTransactionIdState('');
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }, []);

  const resetSwapFlow = resetSwapState;

  return (
    <MerchantSwapContext.Provider
      value={{
        sourceToken,
        setSourceToken,
        sourceAmount,
        setSourceAmount,
        sourceMint,
        setSourceMint,
        fiatCurrency,
        setFiatCurrency,
        activeQuote,
        setActiveQuote,
        selectedAccount,
        setSelectedAccount,
        transactionId,
        setTransactionId,
        resetSwapState,
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
