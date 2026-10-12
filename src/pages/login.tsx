import type { NextPage } from 'next'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/contexts/AuthContext'

import { isValidMerchantToken, getToken } from '@/utils/token'
import { CheckCircle2, ShieldCheck, KeyRound, AlertCircle, ArrowRight, Loader2 } from 'lucide-react'

const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
)

const Login: NextPage = () => {
  const { connected, publicKey, disconnect } = useWallet()
  const { isAuthenticated, loginWithWallet, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect ONLY if authenticated with a valid merchant JWT
  useEffect(() => {
    const token = getToken()
    if (isAuthenticated && !authLoading && isValidMerchantToken(token)) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, authLoading, router])

  const handleWalletLogin = async () => {
    if (!connected || !publicKey) {
      setError('Please connect your Solana wallet first.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await loginWithWallet()
      router.push('/dashboard')
    } catch (err: any) {
      console.error('[FluxPay Login] Authentication error:', err)
      const message = err?.response?.data?.error || err?.message || 'Login failed. Please try again.'
      if (
        message.includes('User rejected') ||
        message.includes('rejected') ||
        message.includes('Signature request rejected')
      ) {
        setError('Signature rejected in wallet. Please click "Sign Message" to authenticate.')
      } else if (message.includes('No nonce found') || err?.response?.status === 400) {
        setError('Verification challenge expired. Please click "Sign Message" to try again.')
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  const walletShort = publicKey ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` : ''

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0B0F19] transition-colors font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 pt-28 pb-12 relative">
        <div className="w-full max-w-[420px]">
          <div className="bg-white dark:bg-[#0B0F19] border border-gray-200 dark:border-white/10 rounded-[1.25rem] p-8 shadow-xl">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-11 w-11 bg-gradient-to-br from-[#8B5CF6] to-[#14B8A6] rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <i className="ri-flashlight-line text-white text-xl"></i>
              </div>
              <span className="text-[24px] font-bold text-gray-900 dark:text-white tracking-tight">FluxPay</span>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-[22px] font-bold text-gray-900 dark:text-white mb-1">Merchant Portal</h1>
              <p className="text-[13px] text-gray-500 dark:text-slate-400">
                Connect wallet and sign to enter dashboard
              </p>
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-2 gap-2 mb-6 p-1.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 rounded-xl text-xs font-semibold">
              <div className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg transition-colors ${
                connected
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300'
              }`}>
                {connected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span>1.</span>}
                <span>Connect Wallet</span>
              </div>
              <div className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg transition-colors ${
                connected
                  ? 'bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold'
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
                <span>2.</span>
                <span>Sign Message</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-3.5 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-600 dark:text-red-400 font-medium leading-relaxed">
                  {error}
                </p>
              </div>
            )}

            <div className="space-y-4">
              {/* STEP 1: Connect Wallet */}
              {!connected ? (
                <div className="space-y-3">
                  <div className="flex justify-center flex-col [&_.wallet-adapter-button]:w-full [&_.wallet-adapter-button]:bg-gradient-to-r [&_.wallet-adapter-button]:from-[#8B5CF6] [&_.wallet-adapter-button]:to-[#14B8A6] [&_.wallet-adapter-button]:text-white [&_.wallet-adapter-button]:font-semibold [&_.wallet-adapter-button]:px-6 [&_.wallet-adapter-button]:py-3.5 [&_.wallet-adapter-button]:rounded-xl [&_.wallet-adapter-button]:flex [&_.wallet-adapter-button]:items-center [&_.wallet-adapter-button]:justify-center [&_.wallet-adapter-button:hover]:opacity-90 [&_.wallet-adapter-button]:transition-opacity [&_.wallet-adapter-button]:h-auto">
                    <WalletMultiButton />
                  </div>
                  <p className="text-center text-xs text-gray-500 dark:text-slate-400">
                    Supports Phantom, Backpack, and Solflare
                  </p>
                </div>
              ) : (
                /* STEP 2: Wallet Connected -> Prompt Signature */
                <div className="space-y-4">
                  {/* Connected Wallet Badge */}
                  <div className="p-3.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">Connected</p>
                        <p className="text-xs font-mono text-gray-500 dark:text-gray-400">{walletShort}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => disconnect()}
                      className="text-xs text-gray-500 hover:text-red-500 transition-colors px-2 py-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg"
                    >
                      Disconnect
                    </button>
                  </div>

                  {/* Security Notice */}
                  <div className="p-3.5 bg-purple-50/50 dark:bg-purple-900/10 border border-purple-200/50 dark:border-purple-800/20 rounded-xl flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-purple-900 dark:text-purple-300 leading-relaxed">
                      This signature proves you own this wallet. It is free and does <span className="font-semibold">not approve any transaction</span>.
                    </p>
                  </div>

                  {/* Prominent Sign Message Button */}
                  <button
                    type="button"
                    onClick={handleWalletLogin}
                    disabled={loading}
                    className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying signature in wallet...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Sign Message to Enter Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Sign Up Link */}
              <div className="text-center pt-3 border-t border-gray-100 dark:border-white/5">
                <p className="text-[13px] text-gray-500 dark:text-slate-400">
                  New merchant?{' '}
                  <Link href="/signup">
                    <span className="text-[#14B8A6] font-semibold hover:underline cursor-pointer transition-colors">
                      Register your store
                    </span>
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Login