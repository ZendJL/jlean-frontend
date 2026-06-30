'use client'

import { useAuthStore } from '@/lib/stores/auth.store'
import { Bell } from 'lucide-react'

export default function Topbar({ title }: { title?: string }) {
  const user = useAuthStore((s) => s.user)

  return (
    <header className="fixed top-0 left-[240px] right-0 h-[56px] bg-surface border-b border-border flex items-center justify-between px-6 z-30">
      <h1 className="text-base font-semibold text-text">
        {title ?? 'JLean'}
      </h1>

      <div className="flex items-center gap-3">
        {/* Notificaciones */}
        <button className="relative p-2 rounded-lg text-text-muted hover:bg-surface-offset hover:text-text transition-all duration-[180ms]">
          <Bell size={18} />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-surface-offset flex items-center justify-center text-xs font-semibold text-primary uppercase">
            {user?.email?.[0] ?? 'U'}
          </div>
        </div>
      </div>
    </header>
  )
}