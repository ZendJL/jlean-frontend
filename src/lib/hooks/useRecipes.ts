import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { recipesApi } from '@/lib/api/recipes.api'

export function useRecipes() {
  return useQuery({
    queryKey: ['recipes'],
    queryFn:  recipesApi.list,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateRecipe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: recipesApi.create,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['recipes'] }),
  })
}

export function useDeleteRecipe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => recipesApi.delete(id), // fix: era recipesApi.remove
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['recipes'] }),
  })
}

export function useAddIngredient(recipeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { foodId: string; quantityG: number }) =>
      recipesApi.addIngredient(recipeId, body),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['recipes'] }),
  })
}

export function useRemoveIngredient(recipeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ingredientId: string) => recipesApi.removeIngredient(recipeId, ingredientId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['recipes'] }),
  })
}
