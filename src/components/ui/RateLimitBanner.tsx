'use client'

/**
 * Banner reutilizable para mostrar estado de rate limit de APIs externas.
 * Paso 11.2 — resiliencia y fallbacks visuales.
 */
import { Clock, WifiOff } from 'lucide-react'

interface Props {
  source: 'USDA' | 'OFF' | string
  retryAfterSeconds?: number
  onDismiss?: () => void
}

export default function RateLimitBanner({ source, retryAfterSeconds = 60, onDismiss }: Props) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 bg-orange-500/10 border border-orange-500/25
                 rounded-lg px-4 py-3 text-sm"
    >
      <Clock size={16} className="shrink-0 mt-0.5 text-orange-500" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-orange-700 dark:text-orange-400">
          {source} rate limit reached
        </p>
        <p className="mt-0.5 text-xs text-orange-600 dark:text-orange-300">
          The {source} API is temporarily unavailable. Please wait ~{retryAfterSeconds}
          s and try again. Your local food catalog is still fully functional.
        </p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 text-orange-500 hover:text-orange-700 dark:hover:text-orange-300
                     text-lg leading-none mt-0.5"
        >
          &times;
        </button>
      )}
    </div>
  )
}

export function ConnectionErrorBanner({ source, onDismiss }: { source: string; onDismiss?: () => void }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 bg-error/10 border border-error/20 rounded-lg px-4 py-3 text-sm"
    >
      <WifiOff size={16} className="shrink-0 mt-0.5 text-error" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-error">{source} is unreachable</p>
        <p className="mt-0.5 text-xs text-error/80">
          Showing results from your local catalog instead.
        </p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 text-error hover:text-error/70 text-lg leading-none mt-0.5"
        >
          &times;
        </button>
      )}
    </div>
  )
}
