import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard,
  CreditCard,
  ArrowLeftRight,
  Banknote,
  BarChart3,
  Key,
  Webhook,
  BookOpen,
  Users,
  FileText,
  Receipt,
  Repeat,
  Settings,
  LifeBuoy,
  SlidersHorizontal,
  Building2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  mobileOpen: boolean
  setMobileOpen: (v: boolean) => void
}

const navSections = [
  {
    label: 'MAIN',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Swap to Fiat', href: '/dashboard/swap', icon: ArrowLeftRight },
      { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
      { name: 'Refunds', href: '/dashboard/refunds', icon: Repeat },
      { name: 'Settlements', href: '/dashboard/settlements', icon: Banknote },
      { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'DEVELOPERS',
    items: [
      { name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
      { name: 'Webhooks', href: '/dashboard/webhooks', icon: Webhook },
      { name: 'Documentation', href: '/dashboard/docs', icon: BookOpen },
    ],
  },
  {
    label: 'BUSINESS',
    items: [
      { name: 'Team', href: '/dashboard/team', icon: Users },
      { name: 'Billing', href: '/dashboard/billing', icon: Receipt },
    ],
  },
  {
    label: 'SETTINGS',
    items: [
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
      { name: 'Settlement Preference', href: '/dashboard/settings/settlement', icon: SlidersHorizontal },
      { name: 'Payout Accounts', href: '/dashboard/settings/payout-accounts', icon: Building2 },
      { name: 'Support', href: '/dashboard/support', icon: LifeBuoy },
    ],
  },
]

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) {
  const router = useRouter()
  const { logout } = useAuth()

  const isActive = (href: string) => {
    if (href === '/dashboard' || href === '/dashboard/settings') {
      return router.pathname === href
    }
    return router.pathname.startsWith(href)
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      // Fallback if logout fails
      router.push('/login')
    }
  }

  const showLabels = !collapsed || mobileOpen

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen flex flex-col
          bg-white dark:bg-[#0B0F19] border-r border-gray-200 dark:border-white/[0.06]
          transition-all duration-300 ease-in-out
          ${mobileOpen ? 'w-[280px] sm:w-[300px] translate-x-0 shadow-2xl shadow-black/50' : '-translate-x-full'}
          md:translate-x-0 ${collapsed ? 'md:w-20' : 'md:w-64'}
        `}
      >
        {/* Logo & Mobile Close */}
        <div className="flex items-center justify-between px-5 h-16 sm:h-[72px] border-b border-gray-200 dark:border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 min-w-[36px] bg-gradient-to-br from-[#8B5CF6] to-[#14B8A6] rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="text-white text-sm font-bold">⚡</span>
            </div>
            {showLabels && (
              <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight whitespace-nowrap">
                FluxPay
              </span>
            )}
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 dark:text-gray-400 transition-colors ml-auto cursor-pointer"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
          {navSections.map((section) => (
            <div key={section.label}>
              {showLabels && (
                <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">
                  {section.label}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                    >
                      <div
                        className={`
                          group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
                          transition-all duration-200 relative
                          ${active
                            ? 'bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white shadow-lg shadow-purple-500/20 font-semibold'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white font-medium'
                          }
                          ${!showLabels ? 'justify-center' : ''}
                        `}
                        title={!showLabels ? item.name : undefined}
                      >
                        <Icon size={20} className={`flex-shrink-0 ${active ? 'text-white' : ''}`} />
                        {showLabels && (
                          <span className="text-sm whitespace-nowrap">{item.name}</span>
                        )}
                        {active && showLabels && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 px-3 pb-4 pt-2 border-t border-gray-200 dark:border-white/[0.06] space-y-2">
          {/* Pricing Card */}
          {showLabels && (
            <Link href="/dashboard/billing" onClick={() => setMobileOpen(false)}>
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-teal-50 dark:from-purple-900/20 dark:to-teal-900/20 border border-purple-200 dark:border-purple-800/30 cursor-pointer hover:shadow-md transition-all">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Current Plan
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                  Pro Plan
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  $50/month
                </p>
              </div>
            </Link>
          )}

          {/* Collapse toggle - tablet/desktop */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white transition-all duration-200 cursor-pointer"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            {showLabels && <span className="text-sm font-medium">Collapse</span>}
          </button>

          {/* Logout */}
          <button
            onClick={() => {
              setMobileOpen(false)
              handleLogout()
            }}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10
              transition-all duration-200 cursor-pointer
              ${!showLabels ? 'justify-center' : ''}
            `}
          >
            <LogOut size={20} />
            {showLabels && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
