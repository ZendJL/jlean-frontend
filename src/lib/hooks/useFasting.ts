import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fastingApi, FastingConfig } from '@/lib/api/fasting.api'

export function useFastingStatus() {
  return useQuery({
    queryKey: ['fasting', 'status'],
    queryFn:  fastingApi.getStatus,
    refetchInterval: 60_000, // refresca cada minuto
  })
}

export function useFastingConfig() {
  return useQuery({ queryKey: ['fasting', 'config'], queryFn: fastingApi.getConfig })
}

export function useSetFastingConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: FastingConfig) => fastingApi.setConfig(dto),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['fasting'] })
      qc.invalidateQueries({ queryKey: ['dashboard', 'today'] })
    },
  })
}
