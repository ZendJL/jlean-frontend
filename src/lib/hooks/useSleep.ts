import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sleepApi, CreateSleepDto } from '@/lib/api/sleep.api'

export function useSleepHistory() {
  return useQuery({ queryKey: ['sleep', 'history'], queryFn: () => sleepApi.list(14) })
}

export function useLastSleep() {
  return useQuery({ queryKey: ['sleep', 'last'], queryFn: sleepApi.getLast })
}

export function useLogSleep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateSleepDto) => sleepApi.create(dto),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['sleep'] })
      qc.invalidateQueries({ queryKey: ['dashboard', 'today'] })
    },
  })
}
