import React, { createContext, useContext, useState, useEffect } from 'react';

export const TOKENS = [
  {
    symbol: 'SOL',
    name: 'Solana',
    balance: 2.45,
    rateNgn: 300153,
    iconBg: 'from-[#9945FF] to-[#14F195]',
    badge: 'Native',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    balance: 520.00,
    rateNgn: 1615,
    iconBg: 'from-[#2775CA] to-[#0A4B8A]',
    badge: 'Stable',
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    balance: 300.00,
    rateNgn: 1615,
    iconBg: 'from-[#26A17B] to-[#176249]',
    badge: 'Stable',
  },
  {
    symbol: 'JUP',
    name: 'Jupiter',
    balance: 125,
    rateNgn: 1000,
    iconBg: 'from-[#C98028] to-[#19E4A9]',
    badge: 'DEX',
  },
  {
    symbol: 'BONK',
    name: 'Bonk',
    balance: 12500,
    rateNgn: 1.523,
    iconBg: 'from-[#F18E38] to-[#D4501D]',
    badge: 'Meme',
  },
  {
    symbol: 'PYTH',
    name: 'Pyth Network',
    balance: 450,
    rateNgn: 420,
    iconBg: 'from-[#7954D8] to-[#512DAB]',
    badge: 'Oracle',
  },
  {
    symbol: 'JTO',
    name: 'Jito',
    balance: 35,
    rateNgn: 3800,
    iconBg: 'from-[#38D39F] to-[#10855A]',
    badge: 'DeFi',
  }
];

export const FIATS = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
];

export const INITIAL_BANK_ACCOUNTS = [
  {
    id: 'opay',
    bankName: 'OPay',
    provider: 'OPay',
    accountNumber: '080XXXXXXXX',
    accountName: 'UDUAK GABRIEL AKPAN',
    isDefault: true,
    isVerified: true,
  },
  {
    id: 'gtbank',
    bankName: 'Guaranty Trust Bank (GTBank)',
    provider: 'Bank',
    accountNumber: '0123456789',
    accountName: 'UDUAK GABRIEL AKPAN',
    isDefault: false,
    isVerified: true,
  }
];

const INITIAL_TRANSACTIONS = [
  {
    id: 'FP-8X294B91',
    token: 'BONK',
    tokenAmount: '10,000',
    fiatAmount: '15,230',
    currency: 'NGN',
    method: 'OPay',
    destination: 'OPay 080XXXXXXXX',
    recipient: 'UDUAK GABRIEL AKPAN',
    status: 'Completed',
    txHash: '5K8aB4m8zWxP9uN21vQ7yTR6...9xLP',
    payoutRef: 'BR-882390141',
    date: '23 Sep 2026, 14:32',
    rate: '1 BONK = ₦1.523',
    fee: '₦152',
    networkFee: '₦12'
  },
  {
    id: 'FP-7M910K32',
    token: 'SOL',
    tokenAmount: '1.5',
    fiatAmount: '445,728',
    currency: 'NGN',
    method: 'Bank',
    destination: 'Bank Account 0123456789',
    recipient: 'UDUAK GABRIEL AKPAN',
    status: 'Completed',
    txHash: '3Nz4X9kLmP8wQ7vR1yS2aB8...1mKP',
    payoutRef: 'BR-771923055',
    date: '22 Sep 2026, 10:15',
    rate: '1 SOL ≈ ₦300,153',
    fee: '₦4,502',
    networkFee: '₦12'
  },
  {
    id: 'FP-6B431L88',
    token: 'USDC',
    tokenAmount: '250',
    fiatAmount: '380,000',
    currency: 'NGN',
    method: 'OPay',
    destination: 'OPay 080XXXXXXXX',
    recipient: 'UDUAK GABRIEL AKPAN',
    status: 'Processing',
    txHash: '8Vx2M6zKqW3rT5yU9iO4pL1...4qTT',
    payoutRef: 'BR-665109210',
    date: '23 Sep 2026, 18:40',
    rate: '1 USDC = ₦1,535',
    fee: '₦3,800',
    networkFee: '₦12'
  },
  {
    id: 'FP-5Y882V14',
    token: 'JUP',
    tokenAmount: '5',
    fiatAmount: '2,300',
    currency: 'NGN',
    method: 'Bank',
    destination: 'Bank Account 2012938471',
    recipient: 'UDUAK GABRIEL AKPAN',
    status: 'Failed',
    txHash: '2Kk9P7vXzY1uM4rT8wE6oQ3...8zQQ',
    payoutRef: 'BR-554192088',
    date: '21 Sep 2026, 09:05',
    rate: '1 JUP = ₦464.6',
    fee: '₦23',
    networkFee: '₦12'
  }
];

const ConsumerContext = createContext(null);

export function ConsumerProvider({ children }) {
  // Wallet state
  const [wallet, setWallet] = useState({
    connected: true,
    address: '7xK9VqBfLmN4wE2rP1zT8uY5kQ3mP8wB9qY8uN29Pq8',
    displayAddress: '7xK...9Pq',
    walletType: 'Phantom',
    balanceNgn: 1245320,
    isConnecting: false,
    isSigning: false
  });

  // Sell quote state (Consumer flow)
  const [sellState, setSellState] = useState({
    token: TOKENS.find(t => t.symbol === 'SOL') || TOKENS[0],
    amount: '1.50',
    fiatCurrency: 'NGN',
    fiatSymbol: '₦',
    payoutMethod: 'OPay',
    payoutDetails: {
      provider: 'OPay',
      accountNumber: '080XXXXXXXX',
      accountName: 'UDUAK GABRIEL AKPAN',
      verified: true
    },
    quoteExpiresSeconds: 30,
    lastTxId: 'FP-8X294B91'
  });

  // Additional state for Merchant and shared swap flows
  const [selectedToken, setSelectedTokenState] = useState(TOKENS[0]);
  const [cryptoAmount, setCryptoAmountState] = useState('1.5');
  const [selectedFiat, setSelectedFiat] = useState(FIATS[0]);
  const [bankAccounts, setBankAccounts] = useState(INITIAL_BANK_ACCOUNTS);
  const [selectedAccount, setSelectedAccountState] = useState(INITIAL_BANK_ACCOUNTS[0]);
  const [activeQuote, setActiveQuote] = useState({
    rate: 300153,
    expiresIn: 30,
    fee: 4502,
    networkFee: 12,
  });

  // Synchronizers
  const setSelectedToken = (token) => {
    setSelectedTokenState(token);
    if (token) {
      selectToken(token.symbol);
    }
  };

  const setCryptoAmount = (val) => {
    setCryptoAmountState(val);
    setAmount(val);
  };

  const setSelectedAccount = (acc) => {
    setSelectedAccountState(acc);
    if (acc) {
      setPayoutDetails({
        provider: acc.bankName || acc.provider || 'OPay',
        accountNumber: acc.accountNumber || '',
        accountName: acc.accountName || 'UDUAK GABRIEL AKPAN',
        verified: true
      });
    }
  };

  const addBankAccount = (acc) => {
    setBankAccounts(prev => [acc, ...prev]);
  };

  const generateQuote = () => {
    const rate = selectedToken?.rateNgn || 300153;
    const gross = (parseFloat(cryptoAmount) || 0) * rate;
    const feeVal = Math.round(gross * 0.01);
    setActiveQuote({
      rate,
      expiresIn: 30,
      fee: feeVal,
      networkFee: 12,
    });
  };

  // Transactions list
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);

  const connectWallet = (walletType) => {
    setWallet(prev => ({ ...prev, isConnecting: true, walletType }));
    return new Promise(resolve => {
      setTimeout(() => {
        setWallet(prev => ({
          ...prev,
          isConnecting: false,
          connected: true,
          walletType,
          address: '7xK9VqBfLmN4wE2rP1zT8uY5kQ3mP8wB9qY8uN29Pq8',
          displayAddress: '7xK...9Pq',
        }));
        resolve(true);
      }, 1200);
    });
  };

  const signMessage = () => {
    setWallet(prev => ({ ...prev, isSigning: true }));
    return new Promise(resolve => {
      setTimeout(() => {
        setWallet(prev => ({ ...prev, isSigning: false }));
        resolve(true);
      }, 1000);
    });
  };

  const disconnectWallet = () => {
    setWallet(prev => ({
      ...prev,
      connected: false,
      isConnecting: false,
      isSigning: false
    }));
  };

  const selectToken = (symbol) => {
    const found = TOKENS.find(t => t.symbol === symbol) || TOKENS[0];
    setSelectedTokenState(found);
    setSellState(prev => ({
      ...prev,
      token: found,
      amount: found.symbol === 'BONK' ? '10000' : found.symbol === 'SOL' ? '1.50' : '100'
    }));
  };

  const setAmount = (val) => {
    setSellState(prev => ({ ...prev, amount: val }));
  };

  const setPayoutDetails = (details) => {
    setSellState(prev => ({
      ...prev,
      payoutMethod: details.provider?.toLowerCase().includes('opay') ? 'OPay' : 'Bank Account',
      payoutDetails: {
        ...prev.payoutDetails,
        ...details
      }
    }));
  };

  const addTransaction = (tx) => {
    setTransactions(prev => [tx, ...prev]);
    setSellState(prev => ({ ...prev, lastTxId: tx.id }));
  };

  // Computations
  const numericAmount = parseFloat(cryptoAmount || sellState.amount) || 0;
  const currentToken = selectedToken || sellState.token || TOKENS[0];
  const grossFiat = Math.round(numericAmount * (currentToken.rateNgn || 300153));
  const fee = Math.max(12, Math.round(grossFiat * 0.01));
  const networkFee = 12;
  const netFiat = Math.max(0, grossFiat - fee - networkFee);
  const fiatAmount = grossFiat.toString();

  return (
    <ConsumerContext.Provider
      value={{
        wallet,
        tokens: TOKENS,
        fiats: FIATS,
        sellState,
        numericAmount,
        grossFiat,
        fee,
        networkFee,
        netFiat,
        transactions,
        connectWallet,
        signMessage,
        disconnectWallet,
        selectToken,
        setAmount,
        setPayoutDetails,
        addTransaction,
        setSellState,

        // Merchant and cross-flow state
        selectedToken: currentToken,
        setSelectedToken,
        cryptoAmount,
        setCryptoAmount,
        selectedFiat: selectedFiat || FIATS[0],
        setSelectedFiat,
        fiatAmount,
        activeQuote,
        generateQuote,
        bankAccounts: bankAccounts || INITIAL_BANK_ACCOUNTS,
        setBankAccounts,
        selectedAccount: selectedAccount || INITIAL_BANK_ACCOUNTS[0],
        setSelectedAccount,
        addBankAccount,
      }}
    >
      {children}
    </ConsumerContext.Provider>
  );
}

export function useConsumer() {
  const context = useContext(ConsumerContext);
  if (!context) {
    // Return resilient fallback during SSR / prerender if mounted outside provider
    return {
      tokens: TOKENS,
      fiats: FIATS,
      selectedToken: TOKENS[0],
      setSelectedToken: () => {},
      cryptoAmount: '1.5',
      setCryptoAmount: () => {},
      selectedFiat: FIATS[0],
      setSelectedFiat: () => {},
      fiatAmount: '450230',
      activeQuote: { rate: 300153, expiresIn: 30, fee: 4502, networkFee: 12 },
      generateQuote: () => {},
      bankAccounts: INITIAL_BANK_ACCOUNTS,
      setBankAccounts: () => {},
      selectedAccount: INITIAL_BANK_ACCOUNTS[0],
      setSelectedAccount: () => {},
      addBankAccount: () => {},
      sellState: {
        token: TOKENS[0],
        amount: '1.50',
        fiatCurrency: 'NGN',
        fiatSymbol: '₦',
        payoutMethod: 'OPay',
        payoutDetails: {
          provider: 'OPay',
          accountNumber: '080XXXXXXXX',
          accountName: 'UDUAK GABRIEL AKPAN',
          verified: true
        }
      },
      numericAmount: 1.5,
      grossFiat: 450230,
      fee: 4502,
      networkFee: 12,
      netFiat: 445716,
      transactions: INITIAL_TRANSACTIONS,
      connectWallet: async () => {},
      signMessage: async () => {},
      disconnectWallet: () => {},
      selectToken: () => {},
      setAmount: () => {},
      setPayoutDetails: () => {},
      addTransaction: () => {},
      setSellState: () => {},
    };
  }
  return context;
}
