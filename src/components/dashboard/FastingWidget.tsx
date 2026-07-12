'use client'

import { Timer } from 'lucide-react'

interface FastingState {
  active:            boolean
  windowStart?:      string
  windowEnd?:        string
  minutesRemaining?: number
}

interface Props {
  fasting?: FastingState
}

function formatMinutes(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export default function FastingWidget({ fasting }: Props) {
  return (
    <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Timer size={15} className="text-primary" />
        <p className="text-xs font-semibold text-text uppercase tracking-wide">Fasting</p>
      </div>

      {!fasting ? (
        <p className="text-sm text-text-faint">No fasting window configured.</p>
      ) : fasting.active ? (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-medium text-green-500">Fasting window active</span>
          </div>
          {fasting.windowEnd && (
            <p className="text-xs text-text-muted">Eating window opens at {fasting.windowEnd}</p>
          )}
          {fasting.minutesRemaining != null && (
            <p className="text-xs text-text-faint">{formatMinutes(fasting.minutesRemaining)} remaining</p>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-sm font-medium text-primary">Eating window open</span>
          </div>
          {fasting.windowStart && fasting.windowEnd && (
            <p className="text-xs text-text-muted">Fasting: {fasting.windowStart} – {fasting.windowEnd}</p>
          )}
        </div>
      )}
    </div>
  )
}
