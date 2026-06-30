import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supplementsApi, CreateSupplementDto } from '@/lib/api/supplements.api'

export function useSupplements() {
  return useQuery({ queryKey: ['supplements'], queryFn: supplementsApi.list })
}

export function useCreateSupplement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateSupplementDto) => supplementsApi.create(dto),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['supplements'] }),
  })
}

export function useRemoveSupplement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => supplementsApi.remove(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['supplements'] }),
  })
}

export function useLogSupplement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => supplementsApi.log(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['supplements', 'logs', 'today'] }),
  })
}

export function useTodaySupplementLogs() {
  return useQuery({ queryKey: ['supplements', 'logs', 'today'], queryFn: supplementsApi.todayLogs })
}
