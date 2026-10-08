import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useConsumer } from '@/contexts/ConsumerContext';
import ConsumerNavbar from '@/components/Consumer/ConsumerNavbar';
import PageTransition from '@/components/shared/PageTransition';
import { useToast } from '@/components/shared/Toast';

export default function ConnectWallet() {
  const router = useRouter();
  const toast = useToast();
  const { wallet, connectWallet, signMessage } = useConsumer();
  const [connectStep, setConnectStep] = useState('initial');
  const [selectedWalletName, setSelectedWalletName] = useState('');
  const [showNoWalletModal, setShowNoWalletModal] = useState(false);

  // Auto-redirect if already connected
  React.useEffect(() => {
    if (wallet?.connected && connectStep === 'initial') {
      router.replace('/sell/home');
    }
  }, [wallet?.connected, connectStep, router]);

  const wallets = [
    {
      name: 'Phantom',
      badge: 'Solana',
      icon: (
        <div className="w-9 h-9 rounded-2xl bg-[#AB9FF2]/20 border border-[#AB9FF2]/40 flex items-center justify-center text-xl">
          👻
        </div>
      )
    },
    {
      name: 'Solflare',
      badge: 'Solana Native',
      icon: (
        <div className="w-9 h-9 rounded-2xl bg-[#FC8C02]/20 border border-[#FC8C02]/40 flex items-center justify-center text-xl">
          🔥
        </div>
      )
    },
    {
      name: 'Backpack',
      badge: 'xNFT',
      icon: (
        <div className="w-9 h-9 rounded-2xl bg-[#E33E38]/20 border border-[#E33E38]/40 flex items-center justify-center text-xl">
          🎒
        </div>
      )
    },
    {
      name: 'Other Wallets',
      badge: 'WalletConnect',
      icon: (
        <div className="w-9 h-9 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-600 dark:text-teal-400 text-lg">
          <i className="ri-wallet-3-line" />
        </div>
      )
    }
  ];

  const handleSelectWallet = async (name) => {
    setSelectedWalletName(name);
    setConnectStep('connecting');
    try {
      await connectWallet(name);
      setConnectStep('connected_need_sign');
    } catch (err) {
      setConnectStep('initial');
      toast.error(err?.message || 'Connection failed');
    }
  };

  const handleSign = async () => {
    setConnectStep('signing');
    try {
      await signMessage();
      setConnectStep('authenticated');
      toast.success(`Wallet connected: ${wallet.displayAddress || 'Verified'}`);
      setTimeout(() => {
        router.push('/sell/home');
      }, 700);
    } catch (err) {
      setConnectStep('connected_need_sign');
      toast.error(err?.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white flex flex-col justify-between selection:bg-purple-600 selection:text-white relative overflow-x-hidden transition-colors">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-purple-600/10 dark:bg-purple-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-teal-500/10 dark:bg-teal-500/10 rounded-full blur-[130px]" />
      </div>

      {/* Top Navbar */}
      <ConsumerNavbar backHref="/" title="Connect Wallet" />

      {/* Main Connect Card */}
      <PageTransition className="relative z-10 max-w-md w-full mx-auto px-4 py-6 my-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
            Connect Wallet
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Connect your Solana wallet to sell crypto for instant fiat
          </p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-850 p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Step 1: Wallet List */}
            {connectStep === 'initial' && (
              <motion.div
                key="initial"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Available Wallets
                  </span>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                    Solana
                  </span>
                </div>

                <div className="space-y-2.5">
                  {wallets.map((w) => (
                    <motion.button
                      key={w.name}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectWallet(w.name)}
                      className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:border-purple-500/40 dark:hover:border-teal-500/40 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="transition-transform group-hover:scale-110">
                          {w.icon}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-teal-400 transition-colors">
                            {w.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Connect Solana account
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-slate-500 bg-white dark:bg-slate-700 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-600">
                          {w.badge}
                        </span>
                        <i className="ri-arrow-right-s-line text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Quick Connect Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectWallet('Phantom')}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-teal-500 text-white font-bold text-sm shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 transition-all mt-2"
                >
                  <i className="ri-wallet-3-fill text-lg" />
                  <span>Quick Connect Phantom</span>
                </motion.button>
              </motion.div>
            )}

            {/* Step 2: Connecting spinner */}
            {connectStep === 'connecting' && (
              <motion.div
                key="connecting"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-10 flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="w-14 h-14 rounded-2xl border-3 border-teal-500/20 border-t-teal-500 animate-spin" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Connecting to {selectedWalletName}...
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Approve connection in your wallet popup
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 3: Sign Message */}
            {connectStep === 'connected_need_sign' && (
              <motion.div
                key="sign"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                <div className="flex flex-col items-center justify-center text-center py-2">
                  <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-teal-400 mb-3 shadow-md">
                    <i className="ri-shield-keyhole-line text-2xl" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Sign to Authenticate
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Zero gas fees. Confirms you own this Solana wallet.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                  <span className="text-slate-400">Account:</span>
                  <span className="font-mono text-purple-600 dark:text-teal-400 font-bold">{wallet.displayAddress}</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSign}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-teal-500 text-white font-bold text-sm shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2"
                >
                  <i className="ri-quill-pen-line" />
                  <span>Sign &amp; Continue</span>
                </motion.button>
              </motion.div>
            )}

            {/* Step 4: Signing spinner */}
            {connectStep === 'signing' && (
              <motion.div
                key="signing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="w-14 h-14 rounded-2xl border-3 border-purple-500/20 border-t-purple-600 animate-spin" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Waiting for signature...
                </h3>
              </motion.div>
            )}

            {/* Step 5: Authenticated */}
            {connectStep === 'authenticated' && (
              <motion.div
                key="authenticated"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 flex flex-col items-center justify-center text-center space-y-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400 text-3xl font-bold">
                  ✓
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Wallet Authenticated!
                </h3>
                <p className="text-xs text-slate-400">
                  Redirecting to your portfolio...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* No Wallet Link */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setShowNoWalletModal(true)}
            className="text-xs text-slate-500 hover:text-purple-600 dark:hover:text-teal-400 transition-colors inline-flex items-center gap-1.5"
          >
            <span>⚡ No wallet? Get one free</span>
            <i className="ri-external-link-line text-xs" />
          </button>
        </div>
      </PageTransition>

      {/* No Wallet Modal */}
      <AnimatePresence>
        {showNoWalletModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Get a Solana Wallet</h3>
                <button
                  type="button"
                  onClick={() => setShowNoWalletModal(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <i className="ri-close-line text-lg" />
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                To sell crypto with FluxPay, you need a non-custodial Solana wallet. Both Phantom and Solflare take under 1 minute to install.
              </p>

              <div className="space-y-2">
                <a
                  href="https://phantom.app"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all text-slate-900 dark:text-white"
                >
                  <span className="flex items-center gap-2">
                    <span>👻</span> Phantom Wallet
                  </span>
                  <i className="ri-arrow-right-up-line text-slate-400" />
                </a>

                <a
                  href="https://solflare.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all text-slate-900 dark:text-white"
                >
                  <span className="flex items-center gap-2">
                    <span>🔥</span> Solflare Wallet
                  </span>
                  <i className="ri-arrow-right-up-line text-slate-400" />
                </a>
              </div>

              <button
                type="button"
                onClick={() => setShowNoWalletModal(false)}
                className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-10 py-5 text-center text-xs text-slate-400">
        <p>Non-custodial. Secured by Solana cryptography.</p>
      </footer>
    </div>
  );
}
