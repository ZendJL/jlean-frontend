'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Apple,
  ChefHat,
  BookOpen,
  Pill,
  Moon,
  User,
  LogOut,
  CalendarDays,
} from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { useAuthStore } from '@/lib/stores/auth.store'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/daily-log',   label: 'Daily Log',   icon: BookOpen },
  { href: '/foods',       label: 'Foods',       icon: Apple },
  { href: '/recipes',     label: 'Recipes',     icon: ChefHat },
  { href: '/supplements', label: 'Supplements', icon: Pill },
  { href: '/sleep',       label: 'Sleep',       icon: Moon },
  { href: '/day-types',   label: 'Day Types',   icon: CalendarDays },
  { href: '/profile',     label: 'Profile',     icon: User },
]

export default function Sidebar() {
  const pathname = usePathname()
  const clearAuth = useAuthStore((s) => s.clearAuth)

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] flex flex-col bg-surface border-r border-border z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <Logo size={28} />
        <span className="font-semibold text-text tracking-tight text-lg">JLean</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <ul className="space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-[180ms]',
                    active
                      ? 'bg-surface-offset text-primary font-medium'
                      : 'text-text-muted hover:bg-surface-offset hover:text-text',
                  )}
                >
                  <Icon
                    size={18}
                    className={active ? 'text-primary' : 'text-text-faint'}
                  />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-2 py-3 border-t border-border">
        <button
          onClick={clearAuth}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-text-muted hover:bg-surface-offset hover:text-error transition-all duration-[180ms]"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  )
}