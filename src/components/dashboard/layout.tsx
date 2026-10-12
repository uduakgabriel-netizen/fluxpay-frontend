import { useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/router'
import Sidebar from '@/components/dashboard/sidebar'
import Header from '@/components/dashboard/header'
import BottomNav from '@/components/dashboard/bottom-nav'
import LoadingSkeleton from '@/components/dashboard/loading-skeleton'
import Footer from '@/components/layout/Footer'
import { useTokenGuard } from '@/hooks/useTokenGuard'
import { getToken, clearAuth, isValidMerchantToken } from '@/utils/token'

interface DashboardLayoutProps {
  children: ReactNode
  pageTitle?: string
}

export default function DashboardLayout({ children, pageTitle = 'Dashboard' }: DashboardLayoutProps) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Check token selection
  const { isTokenSelected, isLoading: tokenLoading } = useTokenGuard()

  // Strict Auth check: require valid merchant JWT
  useEffect(() => {
    const token = getToken()
    if (!token || !isValidMerchantToken(token)) {
      clearAuth()
      setAuthChecked(false)
      router.replace('/login')
      return
    }
    setAuthChecked(true)
    setLoading(false)
  }, [router])

  // Responsive: default collapsed on tablet (768px - 1023px), full width on desktop (>= 1024px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setCollapsed(true)
      } else if (window.innerWidth >= 1024) {
        setCollapsed(false)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [router.pathname])

  // Show loading skeleton while checking auth or token selection
  if (!authChecked || loading || tokenLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-300 flex flex-col overflow-x-hidden">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 min-w-0 ${
          collapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <Header onMenuClick={() => setMobileOpen(true)} pageTitle={pageTitle} />
        <main className="p-4 sm:p-5 md:p-6 lg:p-8 flex-1 w-full max-w-full overflow-x-hidden pb-24 md:pb-8">
          {loading ? <LoadingSkeleton /> : children}
        </main>
        <Footer />
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav onMenuClick={() => setMobileOpen(true)} />
    </div>
  )
}
