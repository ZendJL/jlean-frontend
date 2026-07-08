'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, BookOpen, UtensilsCrossed, Pill,
  Moon, Timer, User, LogOut, CalendarDays, Salad, Scale, CalendarRange,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/daily-log',   label: 'Daily Log',   icon: BookOpen },
  { href: '/day-types',   label: 'Day Types',   icon: CalendarDays },
  { href: '/foods',       label: 'Foods',       icon: Salad },
  { href: '/recipes',     label: 'Recipes',     icon: UtensilsCrossed },
  { href: '/meal-plan',   label: 'Meal Plan',   icon: CalendarRange },
  { href: '/supplements', label: 'Supplements', icon: Pill },
  { href: '/sleep',       label: 'Sleep',       icon: Moon },
  { href: '/fasting',     label: 'Fasting',     icon: Timer },
  { href: '/weight',      label: 'Weight',      icon: Scale },
]

export default function Sidebar() {
  const path = usePathname()

  return (
    <aside className="flex flex-col w-56 shrink-0 bg-surface border-r border-border h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-border">
        <span className="text-lg font-bold text-text tracking-tight">JLean</span>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              path === href || path.startsWith(href + '/')
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-text-muted hover:text-text hover:bg-surface-2',
            )}>
            <Icon size={16} />{label}
          </Link>
        ))}
      </nav>

      <div className="px-2 py-4 border-t border-border space-y-0.5">
        <Link href="/profile"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
            path === '/profile' ? 'bg-primary/10 text-primary font-medium' : 'text-text-muted hover:text-text hover:bg-surface-2',
          )}>
          <User size={16} />Profile
        </Link>
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-error hover:bg-error/10 w-full transition-colors">
          <LogOut size={16} />Sign out
        </button>
      </div>
    </aside>
  )
}
