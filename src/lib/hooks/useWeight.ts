import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { weightApi, type CreateWeightDto } from '@/lib/api/weight.api'

export function useWeightHistory(opts?: { from?: string; to?: string; limit?: number }) {
  return useQuery({
    queryKey: ['weight', 'history', opts],
    queryFn:  () => weightApi.list(opts),
    staleTime: 1000 * 60 * 5,
  })
}

export function useLogWeight() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateWeightDto) => weightApi.create(dto),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['weight'] }),
  })
}

export function useDeleteWeight() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => weightApi.remove(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['weight'] }),
  })
}
