import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { foodsApi, type FoodSource, type CreateFoodDto } from '@/lib/api/foods.api'

export const INITIAL_API_STATE = { rateLimited: false, unavailable: false, retryAfterSeconds: undefined as number | undefined }

export function useFoodsSearch(query: string, source: FoodSource) {
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  const [apiError, setApiError] = useState(INITIAL_API_STATE)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400)
    return () => clearTimeout(t)
  }, [query])

  const { data, isFetching, error } = useQuery({
    queryKey: ['foods', 'search', source, debouncedQuery],
    queryFn:  () => foodsApi.search(debouncedQuery, source),
    enabled:  debouncedQuery.trim().length > 1,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

  useEffect(() => {
    if (!error) { setApiError(INITIAL_API_STATE); return }
    const e = error as any
    if (e?.response?.status === 429) {
      const retryAfter = e.response.headers?.['retry-after']
      setApiError({ rateLimited: true, unavailable: false, retryAfterSeconds: retryAfter ? Number(retryAfter) : undefined })
    } else if (e?.code === 'ERR_NETWORK' || e?.response?.status >= 500) {
      setApiError({ rateLimited: false, unavailable: true, retryAfterSeconds: undefined })
    }
  }, [error])

  const clearError = () => setApiError(INITIAL_API_STATE)

  return { data, isFetching, apiError, clearError, debouncedQuery }
}

export function useFoodDetail(foodId: string) {
  return useQuery({
    queryKey: ['foods', 'detail', foodId],
    queryFn:  () => foodsApi.detail(foodId),
    enabled:  !!foodId,
    staleTime: 1000 * 60 * 10,
  })
}

export function useCreateFood() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateFoodDto) => foodsApi.create(dto),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['foods'] }),
  })
}
