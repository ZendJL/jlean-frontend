import { useCallback, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/client'
import { foodsApi, type FoodResult, type FoodSource } from '@/lib/api/foods.api'

export interface FoodSourceOption {
  value: string
  label: string
  qualityStatus?: string
  fallbackMessage?: string
}

// ─── API error state ─────────────────────────────────────────────────────────
export const INITIAL_API_STATE = {
  rateLimited:       false,
  unavailable:       false,
  retryAfterSeconds: 0,
}

// ─── useFoods ────────────────────────────────────────────────────────────────
export function useFoods() {
  return useQuery({
    queryKey: ['foods'],
    queryFn: () => api.get('/foods').then(r => r.data),
  })
}

// ─── useFoodSources ──────────────────────────────────────────────────────────
export function useFoodSources() {
  return useQuery({
    queryKey: ['foods', 'sources'],
    queryFn: () => api.get<FoodSourceOption[]>('/foods/sources').then(r => r.data),
    retry: false,
    placeholderData: [
      { value: 'CUSTOM', label: 'Custom',           qualityStatus: 'COMPLETE'   },
      { value: 'PRESET', label: 'Preset',           qualityStatus: 'COMPLETE'   },
      { value: 'USDA',   label: 'USDA',             qualityStatus: 'PARTIAL',   fallbackMessage: 'External source unavailable, using cached or local data.' },
      { value: 'OFF',    label: 'Open Food Facts',  qualityStatus: 'UNVERIFIED', fallbackMessage: 'Search is manual-only and may fall back to internal foods.' },
    ],
  })
}

// ─── useCreateFood ───────────────────────────────────────────────────────────
export function useCreateFood() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: any) => api.post('/foods', payload).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['foods'] }),
  })
}

// ─── useFoodsSearch ──────────────────────────────────────────────────────────
export function useFoodsSearch(query: string, source: FoodSource) {
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  const [apiError, setApiError]             = useState({ ...INITIAL_API_STATE })

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400)
    return () => clearTimeout(t)
  }, [query])

  const clearError = useCallback(() => setApiError({ ...INITIAL_API_STATE }), [])

  const result = useQuery({
    queryKey: ['foods', 'search', source, debouncedQuery],
    queryFn: async (): Promise<FoodResult[]> => {
      if (debouncedQuery.trim().length < 2) return []
      try {
        return await foodsApi.search(debouncedQuery, source)
      } catch (err: any) {
        const status = err?.response?.status
        if (status === 429) {
          const retryAfter = Number(err.response.headers?.['retry-after'] ?? 60)
          setApiError({ rateLimited: true, unavailable: false, retryAfterSeconds: retryAfter })
        } else {
          setApiError({ rateLimited: false, unavailable: true, retryAfterSeconds: 0 })
        }
        return []
      }
    },
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 30_000,
  })

  return { ...result, apiError, clearError, debouncedQuery }
}

// ─── useFoodDetail ───────────────────────────────────────────────────────────
export function useFoodDetail(foodId: string | null) {
  return useQuery({
    queryKey: ['foods', 'detail', foodId],
    queryFn: () => foodsApi.detail(foodId!),
    enabled: !!foodId,
  })
}
