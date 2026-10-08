import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import nacl from 'tweetnacl';
import bs58Pkg from 'bs58';
import { authApi } from '@/services/api/authApi';
import { assetsApi } from '@/services/api/assetsApi';
import { quoteApi } from '@/services/api/quoteApi';
import { payoutApi } from '@/services/api/payoutApi';
import { transactionsApi } from '@/services/api/transactionsApi';

const bs58 = (bs58Pkg && bs58Pkg.default) || bs58Pkg;

export const TOKENS = [
  {
    symbol: 'SOL',
    mint: 'So11111111111111111111111111111111111111112',
    name: 'Solana',
    decimals: 9,
    balance: 0,
    rateNgn: 0,
    iconBg: 'from-[#9945FF] to-[#14F195]',
    badge: 'Native',
  },
  {
    symbol: 'USDC',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    name: 'USD Coin',
    decimals: 6,
    balance: 0,
    rateNgn: 0,
    iconBg: 'from-[#2775CA] to-[#0A4B8A]',
    badge: 'Stable',
  },
  {
    symbol: 'USDT',
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    name: 'Tether USD',
    decimals: 6,
    balance: 0,
    rateNgn: 0,
    iconBg: 'from-[#26A17B] to-[#176249]',
    badge: 'Stable',
  },
  {
    symbol: 'BONK',
    mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    name: 'Bonk',
    decimals: 5,
    balance: 0,
    rateNgn: 0,
    iconBg: 'from-[#F18E38] to-[#D4501D]',
    badge: 'Meme',
  },
  {
    symbol: 'JUP',
    mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    name: 'Jupiter',
    decimals: 6,
    balance: 0,
    rateNgn: 0,
    iconBg: 'from-[#C98028] to-[#19E4A9]',
    badge: 'DEX',
  },
  {
    symbol: 'PYTH',
    mint: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3AkTrPvuqWeoPj',
    name: 'Pyth Network',
    decimals: 6,
    balance: 0,
    rateNgn: 0,
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

  // Cross-flow state
  const [selectedToken, setSelectedTokenState] = useState(TOKENS[0]);
  const [cryptoAmount, setCryptoAmountState] = useState('1');
  const [selectedFiat, setSelectedFiat] = useState(FIATS[0]);
  const [selectedAccount, setSelectedAccountState] = useState(null);
  const [activeQuote, setActiveQuote] = useState(null);

  // Sell quote state (Consumer flow)
  const [sellState, setSellState] = useState({
    token: TOKENS[0],
    amount: '1',
    fiatCurrency: 'NGN',
    fiatSymbol: '₦',
    payoutMethod: 'Bank Account',
    payoutDetails: {
      id: '',
      provider: '',
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
          networkFee: `₦${t.networkFee || '0'}`,
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

    // 1. Fetch real sellable tokens from backend
    assetsApi
      .getSellableTokens()
      .then((res) => {
        if (!mounted || !res || !Array.isArray(res.tokens) || res.tokens.length === 0) return;
        const mapped = res.tokens.map((t) => {
          const existing = TOKENS.find((x) => x.symbol === t.symbol || x.mint === t.mint) || {};
          return {
            symbol: t.symbol,
            mint: t.mint,
            name: t.name,
            decimals: t.decimals,
            balance: t.balance !== undefined ? t.balance : 0,
            rateNgn: t.rateNgn || 0,
            iconBg: existing.iconBg || 'from-[#9945FF] to-[#14F195]',
            badge: existing.badge || 'Solana',
          };
        });
        setTokens(mapped);
        const sol = mapped.find((m) => m.symbol === 'SOL') || mapped[0];
        if (sol) {
          setSelectedTokenState(sol);
          setSellState((prev) => ({ ...prev, token: sol }));
        }
      })
      .catch((err) => {
        console.warn('[ConsumerContext] Could not load tokens from API:', err);
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
            balanceNgn: 0,
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
      await authApi.verify(walletAddress, nonce, signatureBase58);

      const disp = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
      setWallet({
        connected: true,
        address: walletAddress,
        displayAddress: disp,
        walletType,
        balanceNgn: 0,
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
      amount: '1',
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
    const srcToken = params?.sourceToken || selectedToken?.symbol || sellState.token?.symbol || 'SOL';
    const foundToken = tokens.find((t) => t.symbol === srcToken) || selectedToken || sellState.token;
    const srcMint = params?.sourceMint || foundToken?.mint || 'So11111111111111111111111111111111111111112';
    const srcAmount = params?.sourceAmount || cryptoAmount || sellState.amount || '1';
    const fiatCurr = params?.fiatCurrency || selectedFiat?.code || sellState.fiatCurrency || 'NGN';

    try {
      const q = await quoteApi.generateQuote({
        sourceToken: srcToken,
        sourceMint: srcMint,
        sourceAmount: String(srcAmount),
        fiatCurrency: fiatCurr,
      });

      const parsedRate = Number(q.rate) || 0;
      const parsedFee = Number(q.fee) || 0;
      const parsedNetworkFee = Number(q.networkFee) || 0;
      const parsedNet = Number(q.netAmount) || 0;
      const parsedFiat = Number(q.fiatAmount) || 0;

      const newQuote = {
        quoteId: q.quoteId,
        rate: parsedRate,
        expiresIn: q.expiresInSeconds || 30,
        expiresAt: q.expiresAt,
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
      console.error('[ConsumerContext] generateQuote API error:', err);
      throw err;
    }
  };

  const addBankAccount = async (accData) => {
    const created = await payoutApi.addAccount({
      bankName: accData.bankName || accData.provider || 'Bank Account',
      bankCode: accData.bankCode || '',
      accountNumber: accData.accountNumber,
      accountName: accData.accountName,
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
        provider: acc.bankName || acc.provider || 'Bank Account',
        accountNumber: acc.accountNumber || '',
        accountName: acc.accountName || '',
        verified: true,
      });
    }
  };

  // Computations strictly from real active quote
  const numericAmount = parseFloat(cryptoAmount || sellState.amount) || 0;
  const currentToken = selectedToken || sellState.token || tokens[0];
  const grossFiat = activeQuote?.fiatAmount !== undefined ? activeQuote.fiatAmount : 0;
  const fee = activeQuote?.fee !== undefined ? activeQuote.fee : 0;
  const networkFee = activeQuote?.networkFee !== undefined ? activeQuote.networkFee : 0;
  const netFiat = activeQuote?.netAmount !== undefined ? activeQuote.netAmount : 0;
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
      selectedToken: TOKENS[0],
      setSelectedToken: () => {},
      cryptoAmount: '1',
      setCryptoAmount: () => {},
      selectedFiat: FIATS[0],
      setSelectedFiat: () => {},
      fiatAmount: '0',
      activeQuote: null,
      generateQuote: async () => {},
      bankAccounts: [],
      setBankAccounts: () => {},
      selectedAccount: null,
      setSelectedAccount: () => {},
      addBankAccount: async () => {},
      sellState: {
        token: TOKENS[0],
        amount: '1',
        fiatCurrency: 'NGN',
        fiatSymbol: '₦',
        payoutMethod: '',
        payoutDetails: {
          id: '',
          provider: '',
          accountNumber: '',
          accountName: '',
          verified: false,
        },
      },
      numericAmount: 0,
      grossFiat: 0,
      fee: 0,
      networkFee: 0,
      netFiat: 0,
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
