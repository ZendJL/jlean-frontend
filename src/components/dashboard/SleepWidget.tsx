'use client'

import { Moon } from 'lucide-react'

interface SleepState {
  lastNightHours?:  number
  recommended?:     number
  recoveryStatus?:  string
}

interface Props {
  sleep?: SleepState
}

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  OPTIMAL:     { color: 'text-green-500',  label: 'Optimal recovery' },
  ADEQUATE:    { color: 'text-blue-400',   label: 'Adequate'         },
  SUBOPTIMAL:  { color: 'text-yellow-500', label: 'Suboptimal'       },
  POOR:        { color: 'text-red-500',    label: 'Poor recovery'    },
}

export default function SleepWidget({ sleep }: Props) {
  const statusCfg = sleep?.recoveryStatus ? STATUS_CONFIG[sleep.recoveryStatus] : null
  const pct = (sleep?.lastNightHours && sleep?.recommended)
    ? Math.min((sleep.lastNightHours / sleep.recommended) * 100, 100)
    : null

  return (
    <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Moon size={15} className="text-primary" />
        <p className="text-xs font-semibold text-text uppercase tracking-wide">Sleep</p>
      </div>

      {!sleep || sleep.lastNightHours == null ? (
        <p className="text-sm text-text-faint">No sleep entry logged yet.</p>
      ) : (
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-2xl font-bold text-text">{sleep.lastNightHours.toFixed(1)}</span>
              <span className="text-sm text-text-muted ml-1">h</span>
            </div>
            {statusCfg && (
              <span className={`text-xs font-medium ${statusCfg.color}`}>{statusCfg.label}</span>
            )}
          </div>

          {pct !== null && (
            <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  pct >= 100 ? 'bg-green-500' : pct >= 75 ? 'bg-blue-400' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          )}

          {sleep.recommended && (
            <p className="text-xs text-text-faint">Target: {sleep.recommended}h recommended</p>
          )}
        </div>
      )}
    </div>
  )
}
