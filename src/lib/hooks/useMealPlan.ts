import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mealPlanApi, type CreateMealPlanDto, type AddMealPlanItemDto } from '@/lib/api/mealPlan.api'

export function useMealPlans() {
  return useQuery({
    queryKey: ['meal-plans'],
    queryFn:  () => mealPlanApi.list(),
    staleTime: 1000 * 60 * 5,
  })
}

export function useMealPlan(id: string | null) {
  return useQuery({
    queryKey: ['meal-plans', id],
    queryFn:  () => mealPlanApi.getOne(id!),
    enabled:  !!id,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateMealPlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateMealPlanDto) => mealPlanApi.create(dto),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['meal-plans'] }),
  })
}

export function useDeleteMealPlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => mealPlanApi.remove(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['meal-plans'] }),
  })
}

export function useAddMealPlanItem(planId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: AddMealPlanItemDto) => mealPlanApi.addItem(planId, dto),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['meal-plans', planId] }),
  })
}

export function useRemoveMealPlanItem(planId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) => mealPlanApi.removeItem(planId, itemId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['meal-plans', planId] }),
  })
}

export function useApplyMealPlanToLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (planId: string) => mealPlanApi.applyToLog(planId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['diary'] }),
  })
}
