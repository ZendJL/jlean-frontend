import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { dayTypesApi } from '../api/dayTypes.api'

export function useDayTypes() {
  return useQuery({
    queryKey: ['day-types'],
    queryFn:  dayTypesApi.getAll,
  })
}

export function useTodayAssignment() {
  return useQuery({
    queryKey: ['day-types', 'today'],
    queryFn:  dayTypesApi.getToday,        // fix: era getTodayAssignment
  })
}

export function useAssignDayType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ dayTypeId, date }: { dayTypeId: string; date: string }) =>
      dayTypesApi.assign(dayTypeId, date), // fix: era assignToDate
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['day-types', 'today'] })
      qc.invalidateQueries({ queryKey: ['diary'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useRemoveAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (date: string) => dayTypesApi.removeAssignment(date),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['day-types', 'today'] })
      qc.invalidateQueries({ queryKey: ['diary'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useCreateDayType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: dayTypesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['day-types'] }),
  })
}

export function useDeleteDayType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: dayTypesApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['day-types'] }),
  })
}
