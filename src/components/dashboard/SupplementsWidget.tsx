'use client'

import { Pill } from 'lucide-react'

interface Supplement {
  id:      string
  name:    string
  pending: boolean
}

interface Props {
  supplements?: Supplement[]
}

export default function SupplementsWidget({ supplements }: Props) {
  const pending = supplements?.filter(s => s.pending) ?? []
  const taken   = supplements?.filter(s => !s.pending) ?? []

  return (
    <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill size={15} className="text-primary" />
          <p className="text-xs font-semibold text-text uppercase tracking-wide">Supplements</p>
        </div>
        {supplements && supplements.length > 0 && (
          <span className="text-xs text-text-faint">
            {taken.length}/{supplements.length} taken
          </span>
        )}
      </div>

      {!supplements || supplements.length === 0 ? (
        <p className="text-sm text-text-faint">No supplements configured.</p>
      ) : pending.length === 0 ? (
        <p className="text-sm text-green-500">✓ All supplements taken today.</p>
      ) : (
        <ul className="space-y-1.5">
          {pending.map(s => (
            <li key={s.id} className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
              <span className="text-text-muted">{s.name}</span>
              <span className="ml-auto text-xs text-yellow-500">Pending</span>
            </li>
          ))}
          {taken.map(s => (
            <li key={s.id} className="flex items-center gap-2 text-sm opacity-50">
              <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
              <span className="text-text-muted line-through">{s.name}</span>
              <span className="ml-auto text-xs text-green-500">✓</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
