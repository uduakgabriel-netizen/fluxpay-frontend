import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import nacl from 'tweetnacl';
import bs58Pkg from 'bs58';
import { authApi } from '@/services/api/authApi';
import { assetsApi } from '@/services/api/assetsApi';
import { quoteApi } from '@/services/api/quoteApi';
import { payoutApi } from '@/services/api/payoutApi';
import { transactionsApi } from '@/services/api/transactionsApi';
import { offrampApi } from '@/services/api/offrampApi';

const bs58 = (bs58Pkg && bs58Pkg.default) || bs58Pkg;

export const TOKENS = [
  {
    symbol: 'SOL',
    mint: 'So11111111111111111111111111111111111111112',
    name: 'Solana',
    decimals: 9,
    balance: 2.45,
    rateNgn: 300153,
    iconBg: 'from-[#9945FF] to-[#14F195]',
    badge: 'Native',
  },
  {
    symbol: 'USDC',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    name: 'USD Coin',
    decimals: 6,
    balance: 520.00,
    rateNgn: 1615,
    iconBg: 'from-[#2775CA] to-[#0A4B8A]',
    badge: 'Stable',
  },
  {
    symbol: 'USDT',
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    name: 'Tether USD',
    decimals: 6,
    balance: 300.00,
    rateNgn: 1615,
    iconBg: 'from-[#26A17B] to-[#176249]',
    badge: 'Stable',
  },
  {
    symbol: 'BONK',
    mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    name: 'Bonk',
    decimals: 5,
    balance: 100000,
    rateNgn: 1.523,
    iconBg: 'from-[#F18E38] to-[#D4501D]',
    badge: 'Meme',
  },
  {
    symbol: 'JUP',
    mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    name: 'Jupiter',
    decimals: 6,
    balance: 125,
    rateNgn: 1000,
    iconBg: 'from-[#C98028] to-[#19E4A9]',
    badge: 'DEX',
  },
  {
    symbol: 'PYTH',
    mint: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3AkTrPvuqWeoPj',
    name: 'Pyth Network',
    decimals: 6,
    balance: 450,
    rateNgn: 420,
    iconBg: 'from-[#7954D8] to-[#512DAB]',
    badge: 'Oracle',
  },
];

export const FIATS = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
];

function getOrCreateSimulatedKeypair() {
  if (typeof window === 'undefined') {
    return nacl.sign.keyPair();
  }
  try {
    const saved = localStorage.getItem('fluxpay_consumer_sim_kp');
    if (saved) {
      const raw = JSON.parse(saved);
      return {
        publicKey: new Uint8Array(raw.publicKey),
        secretKey: new Uint8Array(raw.secretKey),
      };
    }
    const kp = nacl.sign.keyPair();
    localStorage.setItem(
      'fluxpay_consumer_sim_kp',
      JSON.stringify({
        publicKey: Array.from(kp.publicKey),
        secretKey: Array.from(kp.secretKey),
      })
    );
    return kp;
  } catch {
    return nacl.sign.keyPair();
  }
}

const ConsumerContext = createContext(null);

export function ConsumerProvider({ children }) {
  const [tokens, setTokens] = useState(TOKENS);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Wallet state
  const [wallet, setWallet] = useState({
    connected: false,
    address: '',
    displayAddress: '',
    walletType: 'Phantom',
    balanceNgn: 0,
    isConnecting: false,
    isSigning: false,
  });

  // Sell quote state (Consumer flow)
  const [sellState, setSellState] = useState({
    token: TOKENS[3] || TOKENS[0], // BONK default
    amount: '10000',
    fiatCurrency: 'NGN',
    fiatSymbol: '₦',
    payoutMethod: 'OPay',
    payoutDetails: {
      id: '',
      provider: 'OPay',
      accountNumber: '',
      accountName: '',
      verified: false,
    },
    quoteExpiresSeconds: 30,
    lastTxId: '',
    activeQuoteId: null,
    activeQuote: null,
    currentTxId: null,
  });

  // Additional cross-flow state
  const [selectedToken, setSelectedTokenState] = useState(TOKENS[3] || TOKENS[0]);
  const [cryptoAmount, setCryptoAmountState] = useState('10000');
  const [selectedFiat, setSelectedFiat] = useState(FIATS[0]);
  const [selectedAccount, setSelectedAccountState] = useState(null);
  const [activeQuote, setActiveQuote] = useState({
    quoteId: '',
    rate: 1.523,
    expiresIn: 30,
    fee: 152,
    networkFee: 12,
    netAmount: 15066,
    fiatAmount: 15230,
  });

  // Helper to refresh transactions from backend
  const refreshTransactions = useCallback(async () => {
    try {
      const res = await transactionsApi.list();
      if (res && Array.isArray(res.transactions)) {
        const mapped = res.transactions.map((t) => ({
          id: t.id,
          token: t.sourceToken,
          tokenAmount: t.sourceAmount,
          fiatAmount: t.netAmount || t.fiatAmount,
          currency: t.fiatCurrency || 'NGN',
          method: t.provider || 'Bank Transfer',
          destination: t.bankAccount ? `${t.bankAccount.bankName} ${t.bankAccount.accountNumber}` : 'Local Account',
          recipient: t.bankAccount ? t.bankAccount.accountName : 'Verified Account',
          status: t.status === 'COMPLETED' ? 'Completed' : t.status === 'FAILED' ? 'Failed' : 'Processing',
          txHash: t.swapTxHash || '',
          payoutRef: t.payoutRefId || '',
          date: t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent',
          rate: `1 ${t.sourceToken} = ₦${t.rate}`,
          fee: `₦${t.fee}`,
          networkFee: `₦${t.networkFee || '12'}`,
        }));
        setTransactions(mapped);
      }
    } catch (err) {
      console.warn('[ConsumerContext] Could not load transactions from API:', err);
    }
  }, []);

  // Helper to refresh accounts from backend
  const refreshAccounts = useCallback(async () => {
    try {
      const res = await payoutApi.listAccounts();
      if (res && Array.isArray(res.accounts)) {
        setBankAccounts(res.accounts);
        if (res.accounts.length > 0) {
          const def = res.accounts.find((a) => a.isDefault) || res.accounts[0];
          setSelectedAccountState(def);
          setSellState((prev) => ({
            ...prev,
            payoutMethod: def.bankName || 'Bank Account',
            payoutDetails: {
              id: def.id,
              provider: def.bankName,
              accountNumber: def.accountNumber,
              accountName: def.accountName,
              verified: def.isVerified,
            },
          }));
        }
      }
    } catch (err) {
      console.warn('[ConsumerContext] Could not load accounts from API:', err);
    }
  }, []);

  // On mount: hydrate tokens from backend, check existing session
  useEffect(() => {
    let mounted = true;

    // 1. Fetch real sellable tokens
    assetsApi
      .getSellableTokens()
      .then((res) => {
        if (!mounted || !res || !Array.isArray(res.tokens) || res.tokens.length === 0) return;
        const mapped = res.tokens.map((t) => {
          const existing = TOKENS.find((x) => x.symbol === t.symbol) || {};
          return {
            symbol: t.symbol,
            mint: t.mint,
            name: t.name,
            decimals: t.decimals,
            balance: t.balance !== undefined ? t.balance : (existing.balance || 100),
            rateNgn: t.rateNgn || existing.rateNgn || (t.symbol === 'BONK' ? 1.523 : t.symbol === 'SOL' ? 300153 : 1615),
            iconBg: existing.iconBg || 'from-[#9945FF] to-[#14F195]',
            badge: existing.badge || 'Solana',
          };
        });
        setTokens(mapped);
        const bonk = mapped.find((m) => m.symbol === 'BONK') || mapped[0];
        if (bonk) {
          setSelectedTokenState(bonk);
          setSellState((prev) => ({ ...prev, token: bonk }));
        }
      })
      .catch((err) => {
        console.warn('[ConsumerContext] Could not load tokens from API, using fallback:', err);
      });

    // 2. Validate existing token session
    const token = typeof window !== 'undefined' ? localStorage.getItem('fluxpay_consumer_token') : null;
    if (token) {
      authApi
        .getMe()
        .then((res) => {
          if (!mounted || !res?.user) return;
          const u = res.user;
          const disp = `${u.walletAddress.slice(0, 4)}...${u.walletAddress.slice(-4)}`;
          setWallet({
            connected: true,
            address: u.walletAddress,
            displayAddress: disp,
            walletType: 'Phantom',
            balanceNgn: 1245320,
            isConnecting: false,
            isSigning: false,
          });
          refreshAccounts();
          refreshTransactions();
        })
        .catch(() => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('fluxpay_consumer_token');
          }
        });
    }

    return () => {
      mounted = false;
    };
  }, [refreshAccounts, refreshTransactions]);

  // Connect wallet + real backend nonce & signature verification
  const connectWallet = async (walletType = 'Phantom') => {
    setWallet((prev) => ({ ...prev, isConnecting: true, walletType }));

    try {
      let walletAddress = '';
      let isBrowserWallet = false;

      // Check if browser has Phantom/Solana extension
      if (typeof window !== 'undefined' && window.solana && window.solana.isPhantom) {
        try {
          const resp = await window.solana.connect();
          walletAddress = resp.publicKey.toString();
          isBrowserWallet = true;
        } catch {
          // User rejected browser extension or error, fallback to simulated keypair
        }
      }

      const simKeypair = getOrCreateSimulatedKeypair();
      if (!walletAddress) {
        walletAddress = bs58.encode(simKeypair.publicKey);
      }

      // Step 1: Request nonce from real backend
      const { nonce } = await authApi.requestNonce(walletAddress);

      // Step 2: Sign nonce
      let signatureBase58 = '';
      if (isBrowserWallet && window.solana && window.solana.signMessage) {
        const msgBytes = new TextEncoder().encode(nonce);
        const signed = await window.solana.signMessage(msgBytes);
        const rawSig = signed.signature || signed;
        signatureBase58 = bs58.encode(rawSig);
      } else {
        const msgBytes = new TextEncoder().encode(nonce);
        const signedBytes = nacl.sign.detached(msgBytes, simKeypair.secretKey);
        signatureBase58 = bs58.encode(signedBytes);
      }

      // Step 3: Verify signature with backend
      const authRes = await authApi.verify(walletAddress, nonce, signatureBase58);

      const disp = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
      setWallet({
        connected: true,
        address: walletAddress,
        displayAddress: disp,
        walletType,
        balanceNgn: 1245320,
        isConnecting: false,
        isSigning: false,
      });

      // Load user accounts & transactions
      await refreshAccounts();
      await refreshTransactions();

      return true;
    } catch (err) {
      console.error('[ConsumerContext] connectWallet error:', err);
      setWallet((prev) => ({ ...prev, isConnecting: false }));
      throw err;
    }
  };

  const signMessage = async (customMessage) => {
    setWallet((prev) => ({ ...prev, isSigning: true }));
    try {
      const msg = customMessage || `FluxPay Authorization: ${Date.now()}`;
      const msgBytes = new TextEncoder().encode(msg);

      if (typeof window !== 'undefined' && window.solana && window.solana.signMessage) {
        const res = await window.solana.signMessage(msgBytes);
        const raw = res.signature || res;
        setWallet((prev) => ({ ...prev, isSigning: false }));
        return bs58.encode(raw);
      } else {
        const sim = getOrCreateSimulatedKeypair();
        const sig = nacl.sign.detached(msgBytes, sim.secretKey);
        setWallet((prev) => ({ ...prev, isSigning: false }));
        return bs58.encode(sig);
      }
    } catch (err) {
      setWallet((prev) => ({ ...prev, isSigning: false }));
      throw err;
    }
  };

  const disconnectWallet = () => {
    authApi.logout();
    setWallet({
      connected: false,
      address: '',
      displayAddress: '',
      walletType: 'Phantom',
      balanceNgn: 0,
      isConnecting: false,
      isSigning: false,
    });
    setBankAccounts([]);
    setTransactions([]);
  };

  const selectToken = (symbol) => {
    const found = tokens.find((t) => t.symbol === symbol) || tokens[0];
    setSelectedTokenState(found);
    setSellState((prev) => ({
      ...prev,
      token: found,
      amount: found.symbol === 'BONK' ? '10000' : found.symbol === 'SOL' ? '1.50' : '100',
    }));
  };

  const setAmount = (val) => {
    setSellState((prev) => ({ ...prev, amount: val }));
  };

  const setPayoutDetails = (details) => {
    setSellState((prev) => ({
      ...prev,
      payoutMethod: details.provider?.toLowerCase().includes('opay') ? 'OPay' : 'Bank Account',
      payoutDetails: {
        ...prev.payoutDetails,
        ...details,
      },
    }));
  };

  const addTransaction = (tx) => {
    setTransactions((prev) => [tx, ...prev]);
    setSellState((prev) => ({ ...prev, lastTxId: tx.id }));
  };

  // Generate real quote from backend API
  const generateQuote = async (params) => {
    const srcToken = params?.sourceToken || selectedToken?.symbol || sellState.token?.symbol || 'BONK';
    const foundToken = tokens.find((t) => t.symbol === srcToken) || selectedToken || sellState.token;
    const srcMint = params?.sourceMint || foundToken?.mint || 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';
    const srcAmount = params?.sourceAmount || cryptoAmount || sellState.amount || '10000';
    const fiatCurr = params?.fiatCurrency || selectedFiat?.code || sellState.fiatCurrency || 'NGN';

    try {
      const q = await quoteApi.generateQuote({
        sourceToken: srcToken,
        sourceMint: srcMint,
        sourceAmount: String(srcAmount),
        fiatCurrency: fiatCurr,
      });

      const parsedRate = Number(q.rate) || 1.523;
      const parsedFee = Number(q.fee) || 0;
      const parsedNetworkFee = Number(q.networkFee) || 12;
      const parsedNet = Number(q.netAmount) || 0;
      const parsedFiat = Number(q.fiatAmount) || 0;

      const newQuote = {
        quoteId: q.quoteId,
        rate: parsedRate,
        expiresIn: q.expiresInSeconds || 30,
        fee: parsedFee,
        networkFee: parsedNetworkFee,
        netAmount: parsedNet,
        fiatAmount: parsedFiat,
      };

      setActiveQuote(newQuote);
      setSellState((prev) => ({
        ...prev,
        activeQuoteId: q.quoteId,
        activeQuote: newQuote,
      }));
      return q;
    } catch (err) {
      console.warn('[ConsumerContext] generateQuote API fallback:', err);
      // Resilient calculation if offline
      const rate = foundToken?.rateNgn || 1.523;
      const gross = (parseFloat(srcAmount) || 0) * rate;
      const feeVal = Math.round(gross * 0.01);
      const fallbackQuote = {
        quoteId: `mock_quote_${Date.now()}`,
        rate,
        expiresIn: 30,
        fee: feeVal,
        networkFee: 12,
        netAmount: Math.max(0, gross - feeVal - 12),
        fiatAmount: gross,
      };
      setActiveQuote(fallbackQuote);
      return fallbackQuote;
    }
  };

  const addBankAccount = async (accData) => {
    try {
      const created = await payoutApi.addAccount({
        bankName: accData.bankName || accData.provider || 'OPay',
        bankCode: accData.bankCode || '999992',
        accountNumber: accData.accountNumber,
        accountName: accData.accountName || 'UDUAK GABRIEL AKPAN',
        currency: accData.currency || 'NGN',
        setDefault: true,
      });
      setBankAccounts((prev) => [created, ...prev]);
      setSelectedAccountState(created);
      setSellState((prev) => ({
        ...prev,
        payoutMethod: created.bankName,
        payoutDetails: {
          id: created.id,
          provider: created.bankName,
          accountNumber: created.accountNumber,
          accountName: created.accountName,
          verified: created.isVerified,
        },
      }));
      return created;
    } catch (err) {
      console.warn('[ConsumerContext] addAccount API failed, local fallback:', err);
      const local = {
        id: `acc-${Date.now().toString(36)}`,
        bankName: accData.bankName || 'OPay',
        accountNumber: accData.accountNumber,
        accountName: accData.accountName || 'UDUAK GABRIEL AKPAN',
        currency: accData.currency || 'NGN',
        isDefault: true,
        isVerified: true,
      };
      setBankAccounts((prev) => [local, ...prev]);
      setSelectedAccountState(local);
      return local;
    }
  };

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
        id: acc.id,
        provider: acc.bankName || acc.provider || 'OPay',
        accountNumber: acc.accountNumber || '',
        accountName: acc.accountName || 'UDUAK GABRIEL AKPAN',
        verified: true,
      });
    }
  };

  // Computations
  const numericAmount = parseFloat(cryptoAmount || sellState.amount) || 0;
  const currentToken = selectedToken || sellState.token || tokens[0];
  const grossFiat = Math.round(numericAmount * (activeQuote?.rate || currentToken?.rateNgn || 1.523));
  const fee = activeQuote?.fee !== undefined ? activeQuote.fee : Math.max(12, Math.round(grossFiat * 0.01));
  const networkFee = activeQuote?.networkFee !== undefined ? activeQuote.networkFee : 12;
  const netFiat = activeQuote?.netAmount !== undefined ? activeQuote.netAmount : Math.max(0, grossFiat - fee - networkFee);
  const fiatAmount = grossFiat.toString();

  return (
    <ConsumerContext.Provider
      value={{
        wallet,
        tokens,
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
        refreshTransactions,
        refreshAccounts,

        // Cross-flow & Merchant states
        selectedToken: currentToken,
        setSelectedToken,
        cryptoAmount,
        setCryptoAmount,
        selectedFiat: selectedFiat || FIATS[0],
        setSelectedFiat,
        fiatAmount,
        activeQuote,
        generateQuote,
        bankAccounts,
        setBankAccounts,
        selectedAccount: selectedAccount || bankAccounts[0] || null,
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
    return {
      tokens: TOKENS,
      fiats: FIATS,
      selectedToken: TOKENS[3] || TOKENS[0],
      setSelectedToken: () => {},
      cryptoAmount: '10000',
      setCryptoAmount: () => {},
      selectedFiat: FIATS[0],
      setSelectedFiat: () => {},
      fiatAmount: '15230',
      activeQuote: { quoteId: '', rate: 1.523, expiresIn: 30, fee: 152, networkFee: 12, netAmount: 15066 },
      generateQuote: async () => {},
      bankAccounts: [],
      setBankAccounts: () => {},
      selectedAccount: null,
      setSelectedAccount: () => {},
      addBankAccount: async () => {},
      sellState: {
        token: TOKENS[3] || TOKENS[0],
        amount: '10000',
        fiatCurrency: 'NGN',
        fiatSymbol: '₦',
        payoutMethod: 'OPay',
        payoutDetails: {
          id: '',
          provider: 'OPay',
          accountNumber: '',
          accountName: '',
          verified: false,
        },
      },
      numericAmount: 10000,
      grossFiat: 15230,
      fee: 152,
      networkFee: 12,
      netFiat: 15066,
      transactions: [],
      connectWallet: async () => {},
      signMessage: async () => {},
      disconnectWallet: () => {},
      selectToken: () => {},
      setAmount: () => {},
      setPayoutDetails: () => {},
      addTransaction: () => {},
      setSellState: () => {},
      refreshTransactions: async () => {},
      refreshAccounts: async () => {},
    };
  }
  return context;
}
