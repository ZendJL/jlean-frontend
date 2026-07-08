import { useState, useCallback, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { foodsApi, type FoodSource, type FoodResult, type FoodDetail } from '@/lib/api/foods.api'

export function useDebounce<T>(value: T, delay = 500): T {
  const [debounced, setDebounced] = useState<T>(value)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer.current)
  }, [value, delay])

  return debounced
}

export interface ApiErrorState {
  rateLimited:       boolean
  unavailable:       boolean
  retryAfterSeconds: number
}

export const INITIAL_API_STATE: ApiErrorState = {
  rateLimited: false,
  unavailable: false,
  retryAfterSeconds: 60,
}

export function useFoodsSearch(query: string, source: FoodSource) {
  const debouncedQuery = useDebounce(query, 500)
  const [apiError, setApiError] = useState<ApiErrorState>(INITIAL_API_STATE)

  const result = useQuery<FoodResult[]>({
    queryKey: ['foods', 'search', source, debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return []
      try {
        const data = await foodsApi.search({ q: debouncedQuery, source })
        setApiError(INITIAL_API_STATE)
        return data
      } catch (err: unknown) {
        const e = err as {
          isRateLimited?: boolean
          isServiceUnavailable?: boolean
          retryAfterSeconds?: number
          response?: { status?: number }
        }
        if (e.isRateLimited || e.response?.status === 429) {
          setApiError({ rateLimited: true, unavailable: false, retryAfterSeconds: e.retryAfterSeconds ?? 60 })
        } else if (e.isServiceUnavailable || !e.response) {
          setApiError({ rateLimited: false, unavailable: true, retryAfterSeconds: 60 })
        }
        return []
      }
    },
    enabled: debouncedQuery.trim().length > 1,
    staleTime: 1000 * 60 * 5,
  })

  const clearError = useCallback(() => setApiError(INITIAL_API_STATE), [])

  return { ...result, apiError, clearError, debouncedQuery }
}

export function useFoodDetail(id: string | null) {
  return useQuery<FoodDetail>({
    queryKey: ['foods', 'detail', id],
    queryFn: () => foodsApi.getById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  })
}
