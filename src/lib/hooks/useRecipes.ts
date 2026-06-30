import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { recipesApi, CreateRecipeDto, AddIngredientDto } from '@/lib/api/recipes.api'

export function useRecipes() {
  return useQuery({ queryKey: ['recipes'], queryFn: recipesApi.list })
}

export function useRecipe(id: string) {
  return useQuery({ queryKey: ['recipes', id], queryFn: () => recipesApi.get(id), enabled: !!id })
}

export function useCreateRecipe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateRecipeDto) => recipesApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipes'] }),
  })
}

export function useAddIngredient(recipeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: AddIngredientDto) => recipesApi.addIngredient(recipeId, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipes', recipeId] }),
  })
}

export function useDeleteRecipe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => recipesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipes'] }),
  })
}
