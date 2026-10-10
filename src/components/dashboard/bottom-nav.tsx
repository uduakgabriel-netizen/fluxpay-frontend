import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Banknote,
  BarChart3,
  Menu,
} from 'lucide-react'

interface BottomNavProps {
  onMenuClick: () => void
}

export default function BottomNav({ onMenuClick }: BottomNavProps) {
  const router = useRouter()

  const navItems = [
    {
      name: 'Home',
      href: '/dashboard',
      icon: LayoutDashboard,
      isActive: router.pathname === '/dashboard',
    },
    {
      name: 'Swap',
      href: '/dashboard/swap',
      icon: ArrowLeftRight,
      isActive: router.pathname.startsWith('/dashboard/swap'),
    },
    {
      name: 'Payouts',
      href: '/dashboard/settlements',
      icon: Banknote,
      isActive: router.pathname.startsWith('/dashboard/settlements'),
    },
    {
      name: 'Stats',
      href: '/dashboard/analytics',
      icon: BarChart3,
      isActive: router.pathname.startsWith('/dashboard/analytics'),
    },
  ]

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-xl border-t border-gray-200 dark:border-white/[0.08] px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.4)]"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = item.isActive
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                active
                  ? 'text-[#8B5CF6] dark:text-[#A78BFA] font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  active
                    ? 'bg-purple-100 dark:bg-purple-950/60 shadow-sm'
                    : ''
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight whitespace-nowrap">
                {item.name}
              </span>
            </Link>
          )
        })}

        {/* More Menu Button */}
        <button
          type="button"
          onClick={onMenuClick}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-all cursor-pointer"
          aria-label="More navigation options"
        >
          <div className="p-1 rounded-xl">
            <Menu size={20} strokeWidth={2} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight whitespace-nowrap">
            More
          </span>
        </button>
      </div>
    </nav>
  )
}
