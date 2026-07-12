'use client'

import { AlertTriangle, CheckCircle2 } from 'lucide-react'

interface Props {
  alerts?: string[]
}

export default function AlertsWidget({ alerts }: Props) {
  const hasAlerts = alerts && alerts.length > 0

  return (
    <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle size={15} className={hasAlerts ? 'text-yellow-500' : 'text-text-faint'} />
        <p className="text-xs font-semibold text-text uppercase tracking-wide">Alerts</p>
      </div>

      {!hasAlerts ? (
        <div className="flex items-center gap-2 text-sm text-green-500">
          <CheckCircle2 size={15} />
          <span>No alerts — all good!</span>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {alerts.map((msg, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="text-yellow-500 mt-0.5 shrink-0">⚠</span>
              <span className="text-text-muted">{msg}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
