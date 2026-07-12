import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/client'

export interface FoodSourceOption {
  value: string
  label: string
  qualityStatus?: string
  fallbackMessage?: string
}

export function useFoods() {
  return useQuery({
    queryKey: ['foods'],
    queryFn: () => api.get('/foods').then(r => r.data),
  })
}

export function useFoodSources() {
  return useQuery({
    queryKey: ['foods', 'sources'],
    queryFn: () => api.get<FoodSourceOption[]>('/foods/sources').then(r => r.data),
    retry: false,
    placeholderData: [
      { value: 'CUSTOM', label: 'Custom', qualityStatus: 'COMPLETE' },
      { value: 'PRESET', label: 'Preset', qualityStatus: 'COMPLETE' },
      { value: 'USDA', label: 'USDA', qualityStatus: 'PARTIAL', fallbackMessage: 'External source unavailable, using cached or local data.' },
      { value: 'OFF', label: 'Open Food Facts', qualityStatus: 'UNVERIFIED', fallbackMessage: 'Search is manual-only and may fall back to internal foods.' },
    ],
  })
}

export function useCreateFood() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: any) => api.post('/foods', payload).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['foods'] }),
  })
}
