'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useFoodsSearch, INITIAL_API_STATE } from '@/lib/hooks/useFoods'
import { type FoodSource, type FoodResult } from '@/lib/api/foods.api'
import RateLimitBanner, { ConnectionErrorBanner } from '@/components/ui/RateLimitBanner'
import { ScanBarcode } from 'lucide-react'

// Carga lazy del scanner para no incluirlo en el bundle principal
const BarcodeScanner = dynamic(() => import('./BarcodeScanner'), { ssr: false })

const QUALITY_CONFIG: Record<string, { label: string; color: string }> = {
  COMPLETE:   { label: 'Complete',   color: 'text-green-600  dark:text-green-400' },
  PARTIAL:    { label: 'Partial',    color: 'text-yellow-600 dark:text-yellow-400' },
  UNVERIFIED: { label: 'Unverified', color: 'text-orange-600 dark:text-orange-400' },
  CONFLICTED: { label: 'Conflicted', color: 'text-red-600    dark:text-red-400' },
}

const SOURCE_LABELS: Record<FoodSource, string> = {
  internal: 'My Foods',
  preset:   'Presets',
  usda:     'USDA',
  off:      'Open Food Facts',
}

const TABS: FoodSource[] = ['internal', 'preset', 'usda', 'off']

interface FoodSearchBarProps {
  onSelect?:    (food: Pick<FoodResult, 'id' | 'name'>) => void
  placeholder?: string
  compact?:     boolean
}

export default function FoodSearchBar({ onSelect, placeholder, compact = false }: FoodSearchBarProps) {
  const [query,       setQuery]       = useState('')
  const [activeTab,   setActiveTab]   = useState<FoodSource>('internal')
  const [showScanner, setShowScanner] = useState(false)

  const { data, isFetching, apiError, clearError, debouncedQuery } = useFoodsSearch(query, activeTab)

  const isExternal = activeTab === 'usda' || activeTab === 'off'
  const apiLabel   = SOURCE_LABELS[activeTab]

  const handleSelect = (food: FoodResult) => onSelect?.({ id: food.id, name: food.name })

  const handleBarcodeDetected = (barcode: string) => {
    setShowScanner(false)
    setActiveTab('off')    // barcodes → Open Food Facts
    setQuery(barcode)
  }

  return (
    <div className="space-y-3">
      {showScanner && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Banners */}
      {isExternal && apiError.rateLimited && (
        <RateLimitBanner source={apiLabel} retryAfterSeconds={apiError.retryAfterSeconds} onDismiss={clearError} />
      )}
      {isExternal && apiError.unavailable && (
        <ConnectionErrorBanner source={apiLabel} onDismiss={clearError} />
      )}

      {/* Tabs */}
      {!compact && (
        <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800">
          {TABS.map((src) => (
            <button key={src} onClick={() => { setActiveTab(src); setQuery('') }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === src
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}>
              {SOURCE_LABELS[src]}
            </button>
          ))}
        </div>
      )}

      {/* Input + scan button */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder ?? `Search in ${SOURCE_LABELS[activeTab]}…`}
          disabled={isExternal && (apiError.rateLimited || apiError.unavailable)}
          className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
                     px-4 py-2.5 text-sm pr-20 focus:outline-none focus:ring-2 focus:ring-emerald-500
                     disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isFetching && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          )}
          <button
            type="button"
            onClick={() => setShowScanner(true)}
            title="Scan barcode"
            className="text-gray-400 hover:text-emerald-500 transition-colors p-1 rounded"
          >
            <ScanBarcode size={16} />
          </button>
        </div>
      </div>

      {/* No results */}
      {data && data.length === 0 && debouncedQuery.trim().length > 1 && !isFetching && (
        <p className="text-sm text-gray-500 text-center py-6">
          No results for &ldquo;{debouncedQuery}&rdquo;
          {isExternal && ' — results may come from your local catalog.'}
        </p>
      )}

      {/* List */}
      {data && data.length > 0 && (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700 rounded-xl border border-gray-200
                       dark:border-gray-700 overflow-hidden max-h-80 overflow-y-auto">
          {data.map((food) => (
            <li key={`${food.source}-${food.id}`} onClick={() => handleSelect(food)}
              className={`flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800
                          hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors
                          ${onSelect ? 'cursor-pointer' : ''}`}>
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
