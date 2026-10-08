import type { AppProps } from 'next/app'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { SolanaWalletProvider } from '@/contexts/SolanaWalletContext'
import { PasskeyProvider } from '@/contexts/PasskeyContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { ConsumerProvider } from '@/contexts/ConsumerContext'
import { MerchantSettlementProvider } from '@/contexts/MerchantSettlementContext'
import { MerchantSwapProvider } from '@/contexts/MerchantSwapContext'
import { ToastProvider } from '@/components/shared/Toast'
import '@/styles/globals.css'
import '@/styles/wallet-adapter.css'
import 'remixicon/fonts/remixicon.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <SolanaWalletProvider>
        <PasskeyProvider>
          <AuthProvider>
            <MerchantSettlementProvider>
              <MerchantSwapProvider>
                <ConsumerProvider>
                  <ToastProvider>
                    <Component {...pageProps} />
                  </ToastProvider>
                </ConsumerProvider>
              </MerchantSwapProvider>
            </MerchantSettlementProvider>
          </AuthProvider>
        </PasskeyProvider>
      </SolanaWalletProvider>
    </ThemeProvider>
  )
}
