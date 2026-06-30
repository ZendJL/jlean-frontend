'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, UtensilsCrossed, Pill, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard',  label: 'Dashboard', icon: LayoutDashboard },
  { href: '/daily-log',  label: 'Log',        icon: BookOpen },
  { href: '/recipes',    label: 'Recipes',    icon: UtensilsCrossed },
  { href: '/supplements',label: 'Supps',     icon: Pill },
  { href: '/sleep',      label: 'Sleep',      icon: Moon },
]

export default function MobileNav() {
  const path = usePathname()
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-surface border-t border-border flex md:hidden z-50">
      {NAV.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors',
            path === href || path.startsWith(href + '/')
              ? 'text-primary'
              : 'text-text-faint',
          )}
        >
          <Icon size={20} />
          {label}
        </Link>
      ))}
    </nav>
  )
}
