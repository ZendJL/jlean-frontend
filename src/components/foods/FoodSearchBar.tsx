'use client'

import { useState, useCallback, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api/client'
import RateLimitBanner, { ConnectionErrorBanner } from '@/components/ui/RateLimitBanner'

type FoodSource = 'internal' | 'usda' | 'off'

interface FoodResult {
  id:       string
  name:     string
  calories: number
  proteinG: number
  carbsG:   number
  fatG:     number
  source:   FoodSource
  qualityStatus?: 'COMPLETE' | 'PARTIAL' | 'UNVERIFIED' | 'CONFLICTED'
}

interface ExternalApiState {
  rateLimited: boolean
  unavailable: boolean
  retryAfterSeconds: number
}

const INITIAL_API_STATE: ExternalApiState = { rateLimited: false, unavailable: false, retryAfterSeconds: 60 }

const QUALITY_CONFIG: Record<string, { label: string; color: string }> = {
  COMPLETE:   { label: 'Complete',   color: 'text-green-600  dark:text-green-400' },
  PARTIAL:    { label: 'Partial',    color: 'text-yellow-600 dark:text-yellow-400' },
  UNVERIFIED: { label: 'Unverified', color: 'text-orange-600 dark:text-orange-400' },
  CONFLICTED: { label: 'Conflicted', color: 'text-red-600    dark:text-red-400' },
}

const SOURCE_LABELS: Record<FoodSource, string> = {
  internal: 'My Foods',
  usda:     'USDA',
  off:      'Open Food Facts',
}

const SOURCE_API_KEY: Record<FoodSource, string> = {
  internal: '',
  usda:     'USDA',
  off:      'Open Food Facts',
}

function useDebounce<T>(value: T, delay = 500): T {
  const [debounced, setDebounced] = useState(value)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const set = useCallback(
    (v: T) => {
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setDebounced(v), delay)
    },
    [delay],
  )
  if (value !== debounced) set(value)
  return debounced
}

export default function FoodSearchBar() {
  const [query,     setQuery]     = useState('')
  const [activeTab, setActiveTab] = useState<FoodSource>('internal')
  const [usdaState, setUsdaState] = useState<ExternalApiState>(INITIAL_API_STATE)
  const [offState,  setOffState]  = useState<ExternalApiState>(INITIAL_API_STATE)

  const debouncedQuery = useDebounce(query, 500)

  const getApiState  = (tab: FoodSource) => tab === 'usda' ? usdaState : tab === 'off' ? offState : INITIAL_API_STATE
  const setApiState  = (tab: FoodSource, patch: Partial<ExternalApiState>) => {
    if (tab === 'usda') setUsdaState(prev => ({ ...prev, ...patch }))
    if (tab === 'off')  setOffState(prev  => ({ ...prev, ...patch }))
  }

  const { data, isFetching } = useQuery<FoodResult[]>({
    queryKey: ['foods', activeTab, debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return []
      try {
        const res = await api.get<FoodResult[]>('/foods/search', {
          params: { q: debouncedQuery, source: activeTab },
        })
        // Éxito — resetear estado de error del tab activo
        setApiState(activeTab, INITIAL_API_STATE)
        return res.data
      } catch (err: unknown) {
        const e = err as { response?: { status?: number }; isRateLimited?: boolean; isServiceUnavailable?: boolean; retryAfterSeconds?: number }
        if (e.isRateLimited || e.response?.status === 429) {
          setApiState(activeTab, {
            rateLimited: true,
            unavailable: false,
            retryAfterSeconds: e.retryAfterSeconds ?? 60,
          })
        } else if (e.isServiceUnavailable || !e.response) {
          setApiState(activeTab, { unavailable: true, rateLimited: false, retryAfterSeconds: 60 })
        }
        // Devolver vacío — el backend ya hace fallback al catálogo local
        return []
      }
    },
    enabled: debouncedQuery.trim().length > 1,
    staleTime: 1000 * 60 * 5,
  })

  const currentApiState = getApiState(activeTab)
  const isExternal      = activeTab !== 'internal'
  const apiLabel        = SOURCE_API_KEY[activeTab]

  return (
    <div className="space-y-3">
      {/* Banners de error de APIs externas */}
      {isExternal && currentApiState.rateLimited && (
        <RateLimitBanner
          source={apiLabel}
          retryAfterSeconds={currentApiState.retryAfterSeconds}
          onDismiss={() => setApiState(activeTab, INITIAL_API_STATE)}
        />
      )}
      {isExternal && currentApiState.unavailable && (
        <ConnectionErrorBanner
          source={apiLabel}
          onDismiss={() => setApiState(activeTab, INITIAL_API_STATE)}
        />
      )}

      {/* Tabs de fuente */}
      <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800">
        {(['internal', 'usda', 'off'] as FoodSource[]).map((src) => (
          <button
            key={src}
            onClick={() => setActiveTab(src)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === src
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            {SOURCE_LABELS[src]}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search in ${SOURCE_LABELS[activeTab]}…`}
          disabled={isExternal && currentApiState.rateLimited}
          className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
                     px-4 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500
                     disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {isFetching && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        )}
      </div>

      {/* Sin resultados */}
      {data && data.length === 0 && debouncedQuery.trim().length > 1 && !isFetching && (
        <p className="text-sm text-gray-500 text-center py-6">
          No results for &ldquo;{debouncedQuery}&rdquo;
          {isExternal && ' — results may come from your local catalog.'}
        </p>
      )}

      {/* Lista de resultados */}
      {data && data.length > 0 && (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden max-h-80 overflow-y-auto">
          {data.map((food) => (
            <li
              key={`${food.source}-${food.id}`}
              className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{food.name}</p>
                  {food.qualityStatus && QUALITY_CONFIG[food.qualityStatus] && (
                    <span className={`text-xs ${QUALITY_CONFIG[food.qualityStatus].color} shrink-0`}>
                      · {QUALITY_CONFIG[food.qualityStatus].label}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {food.proteinG?.toFixed(1)}g P · {food.carbsG?.toFixed(1)}g C · {food.fatG?.toFixed(1)}g F
                </p>
              </div>
              <span className="ml-4 text-sm font-semibold text-gray-700 dark:text-gray-300 shrink-0">
                {Math.round(food.calories)} kcal
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
