import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { diaryApi, AddDiaryItemDto } from '@/lib/api/diary.api'

export function useDiary() {
  return useQuery({
    queryKey: ['diary', 'today'],
    queryFn:  diaryApi.getToday,
    staleTime: 1000 * 60,
  })
}

export function useAddDiaryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: AddDiaryItemDto) => diaryApi.addItem(dto),
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
