'use client'

import { useState, useCallback } from 'react'
import { Search, X, AlertTriangle, Clock, WifiOff } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api/client'

interface FoodResult {
  id:       string
  name:     string
  calories: number
  proteinG: number
  carbsG:   number
  fatG:     number
  source:   string
  quality?:  string
}

interface Props {
  onSelect: (food: FoodResult) => void
  placeholder?: string
}

const SOURCE_TABS = [
  { key: 'internal', label: 'My Foods' },
  { key: 'PRESET',   label: 'Presets' },
  { key: 'USDA',     label: 'USDA' },
  { key: 'OFF',      label: 'Barcode / OFF' },
] as const

type Tab = typeof SOURCE_TABS[number]['key']

// Extrae info de error de la respuesta del backend
interface ApiError {
  status?: number
  isRateLimit: boolean
  isFallback: boolean
  retryAfterSeconds?: number
  source?: string
  message?: string
}

function parseApiError(err: unknown): ApiError {
  const e = err as any
  const status = e?.response?.status ?? e?.status
  const data   = e?.response?.data ?? {}

  if (status === 429) {
    return {
      status,
      isRateLimit: true,
      isFallback:  false,
      retryAfterSeconds: data.retryAfterSeconds ?? 60,
      source: data.source,
      message: data.message,
    }
  }
  return { status, isRateLimit: false, isFallback: false, message: data.message ?? e?.message }
}

export default function FoodSearchBar({ onSelect, placeholder = 'Search foods…' }: Props) {
  const [query, setQuery]   = useState('')
  const [search, setSearch] = useState('')
  const [tab, setTab]       = useState<Tab>('internal')

  // debounce fuerte para USDA/OFF (evitar golpear rate limit)
  const debounceMs = (tab === 'USDA' || tab === 'OFF') ? 700 : 350
  const debounced = useDebouncedCallback((v: string) => setSearch(v), debounceMs)

  const { data, isFetching, error } = useQuery({
    queryKey: ['foods', 'search', tab, search],
    queryFn: () =>
      api
        .get<FoodResult[]>('/foods/search', {
          params: { q: search, source: tab !== 'internal' ? tab : undefined },
        })
        .then(r => r.data),
    enabled: search.length >= 2,
    staleTime:  1000 * 60 * 5,
    retry: (failCount, err: any) => {
      // No reintentar si es rate limit (429)
      if (err?.response?.status === 429) return false
      return failCount < 1
    },
  })

  const handleChange = useCallback((v: string) => {
    setQuery(v)
    debounced(v)
  }, [debounced])

  const apiError = error ? parseApiError(error) : null

  const qualityBadge = (q?: string) => {
    if (!q || q === 'COMPLETE') return null
    const colors: Record<string, string> = {
      PARTIAL:    'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
      UNVERIFIED: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
      CONFLICTED: 'bg-red-500/10 text-red-600 dark:text-red-400',
    }
    const labels: Record<string, string> = {
      PARTIAL:    'Partial data',
      UNVERIFIED: 'Unverified',
      CONFLICTED: 'Conflicted',
    }
    return (
      <span
        title={`Data quality: ${q}`}
        className={`text-xs rounded-full px-1.5 py-0.5 font-medium ${
          colors[q] ?? 'bg-surface-offset text-text-muted'
        }`}
      >
        {labels[q] ?? q}
      </span>
    )
  }

  return (
    <div className="space-y-3">
      {/* Source tabs */}
      <div className="flex gap-1 border-b border-border">
        {SOURCE_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setSearch(''); setQuery('') }}
            className={`px-3 py-2 text-sm transition-colors ${
              tab === t.key
                ? 'text-primary border-b-2 border-primary font-medium'
                : 'text-text-muted hover:text-text'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Rate limit / source info banners */}
      {tab === 'USDA' && !apiError && (
        <div className="flex items-center gap-2 text-xs text-text-muted bg-surface-offset rounded-md px-3 py-2">
          <AlertTriangle size={13} className="shrink-0 text-yellow-500" />
          <span>USDA has a 1,000 req/hour limit. Results are cached for 1 hour.</span>
        </div>
      )}
      {tab === 'OFF' && !apiError && (
        <div className="flex items-center gap-2 text-xs text-text-muted bg-surface-offset rounded-md px-3 py-2">
          <AlertTriangle size={13} className="shrink-0 text-yellow-500" />
          <span>Open Food Facts is user-contributed — data quality may vary. Results are cached for 30 min.</span>
        </div>
      )}

      {/* Rate limit error banner */}
      {apiError?.isRateLimit && (
        <div className="flex items-start gap-2 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2.5">
          <Clock size={15} className="shrink-0 mt-0.5 text-orange-500" />
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
              {apiError.source ?? 'External API'} rate limit reached
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-300">
              Please wait ~{apiError.retryAfterSeconds}s before searching again.
              Results from your local catalog are still available in the <strong>My Foods</strong> or <strong>Presets</strong> tabs.
            </p>
          </div>
        </div>
      )}

      {/* Generic connection error */}
      {apiError && !apiError.isRateLimit && (
        <div className="flex items-start gap-2 bg-error/10 border border-error/20 rounded-lg px-3 py-2.5">
          <WifiOff size={15} className="shrink-0 mt-0.5 text-error" />
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-error">Could not reach external source</p>
            <p className="text-xs text-error/80">
              Showing results from your local catalog instead.
              {apiError.message && ` (${apiError.message})`}
            </p>
          </div>
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
        <input
          value={query}
          onChange={e => handleChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2.5 bg-surface border border-border rounded-lg text-sm
                     text-text placeholder:text-text-faint focus:outline-none focus:border-primary"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setSearch('') }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint hover:text-text"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Results */}
      {search.length >= 2 && (
        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          {isFetching && (
            <div className="p-4 text-center text-text-muted text-sm">
              <span className="inline-flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Searching…
              </span>
            </div>
          )}
          {!isFetching && !error && (!data || data.length === 0) && (
            <div className="p-4 text-center text-text-muted text-sm">
              No results found
              {(tab === 'USDA' || tab === 'OFF') && (
                <span className="block mt-1 text-xs text-text-faint">
                  Try fewer words or check your spelling
                </span>
              )}
            </div>
          )}
          {!isFetching && data && data.length > 0 && (
            <ul className="divide-y divide-divider max-h-72 overflow-y-auto">
              {data.map(food => (
                <li key={food.id}>
                  <button
                    onClick={() => onSelect(food)}
                    className="w-full text-left px-4 py-3 hover:bg-surface-2 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm text-text truncate">{food.name}</p>
                        <p className="text-xs text-text-muted">
                          {food.calories} kcal · P {food.proteinG}g · C {food.carbsG}g · F {food.fatG}g
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {qualityBadge(food.quality)}
                        <span className="text-xs text-text-faint uppercase tracking-wide">
                          {food.source}
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
