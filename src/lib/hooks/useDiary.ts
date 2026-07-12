import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { diaryApi } from '@/lib/api/diary.api'

export function useDiary() {
  return useQuery({
    queryKey: ['diary', 'today'],
    queryFn:  diaryApi.today,
    staleTime: 1000 * 30,
  })
}

export function useAddDiaryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: diaryApi.addItem,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['diary', 'today'] })
      qc.invalidateQueries({ queryKey: ['dashboard', 'today'] })
    },
  })
}

export function useRemoveDiaryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) => diaryApi.removeItem(itemId),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['diary', 'today'] })
      qc.invalidateQueries({ queryKey: ['dashboard', 'today'] })
    },
  })
}

export function useUpdateDiaryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, quantityG }: { itemId: string; quantityG: number }) =>
      diaryApi.updateItem(itemId, quantityG),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['diary', 'today'] })
      qc.invalidateQueries({ queryKey: ['dashboard', 'today'] })
    },
  })
}
