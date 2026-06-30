import api from './client'

export interface RecipeIngredient {
  id:        string
  foodId:    string
  foodName:  string
  quantityG: number
  calories:  number
  proteinG:  number
  carbsG:    number
  fatG:      number
}

export interface Recipe {
  id:          string
  name:        string
  servings:    number
  calories:    number
  proteinG:    number
  carbsG:      number
  fatG:        number
  calPerServing: number
  ingredients: RecipeIngredient[]
  createdAt:   string
}

export interface CreateRecipeDto {
  name:     string
  servings: number
}

export interface AddIngredientDto {
  foodId:    string
  quantityG: number
}

export const recipesApi = {
  list:          ()                                     => api.get<Recipe[]>('/recipes').then(r => r.data),
  create:        (dto: CreateRecipeDto)                 => api.post<Recipe>('/recipes', dto).then(r => r.data),
  get:           (id: string)                           => api.get<Recipe>(`/recipes/${id}`).then(r => r.data),
  delete:        (id: string)                           => api.delete(`/recipes/${id}`),
  addIngredient: (id: string, dto: AddIngredientDto)    => api.post<Recipe>(`/recipes/${id}/ingredients`, dto).then(r => r.data),
  removeIngredient: (id: string, ingId: string)         => api.delete(`/recipes/${id}/ingredients/${ingId}`),
}
