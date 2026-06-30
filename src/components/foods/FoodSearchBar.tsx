'use client'

import { useState, useCallback } from 'react'
import { Search, X } from 'lucide-react'
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

export default function FoodSearchBar({ onSelect, placeholder = 'Search foods…' }: Props) {
  const [query, setQuery]   = useState('')
  const [search, setSearch] = useState('')
  const [tab, setTab]       = useState<Tab>('internal')

  const debounced = useDebouncedCallback((v: string) => setSearch(v), 400)

  const { data, isFetching } = useQuery({
    queryKey: ['foods', 'search', tab, search],
    queryFn: () =>
      api
        .get<FoodResult[]>('/foods/search', { params: { q: search, source: tab !== 'internal' ? tab : undefined } })
        .then(r => r.data),
    enabled: search.length >= 2,
    staleTime: 1000 * 60 * 5,
  })

  const handleChange = useCallback((v: string) => {
    setQuery(v)
    debounced(v)
  }, [debounced])

  const qualityBadge = (q?: string) => {
    if (!q || q === 'COMPLETE') return null
    const colors: Record<string, string> = {
      PARTIAL:     'bg-warning/10 text-warning',
      UNVERIFIED:  'bg-gold/10 text-gold',
      CONFLICTED:  'bg-error/10 text-error',
    }
    return (
      <span className={`text-xs rounded-full px-1.5 py-0.5 ${colors[q] ?? ''}`}>{q}</span>
    )
  }

  return (
    <div className="space-y-3">
      {/* Source tabs */}
      <div className="flex gap-1 border-b border-border">
        {SOURCE_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
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
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Results */}
      {search.length >= 2 && (
        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          {isFetching && (
            <div className="p-4 text-center text-text-muted text-sm">Searching…</div>
          )}
          {!isFetching && (!data || data.length === 0) && (
            <div className="p-4 text-center text-text-muted text-sm">No results found.</div>
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
                      <div className="flex items-center gap-1 shrink-0">
                        {qualityBadge(food.quality)}
                        <span className="text-xs text-text-faint">{food.source}</span>
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
