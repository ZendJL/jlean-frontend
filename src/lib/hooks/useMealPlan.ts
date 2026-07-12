import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/client'

export interface MealPlanEntry {
  id: string
  dayOfWeek: string
  mealType: string
  title: string
  notes?: string
}

export function useMealPlan() {
  return useQuery({
    queryKey: ['meal-plan'],
    queryFn: () => api.get<MealPlanEntry[]>('/meal-plan').then(r => r.data),
  })
}

export function useCreateMealPlanEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<MealPlanEntry, 'id'>) => api.post('/meal-plan', payload).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meal-plan'] }),
  })
}

export function useDeleteMealPlanEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/meal-plan/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meal-plan'] }),
  })
}
