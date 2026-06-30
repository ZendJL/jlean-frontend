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

// --- Paso 5.3 / 10.2 avanzado: constructores ---

export type CarbFatBalance = 'balanced' | 'low_carb' | 'low_fat'

export interface BuildByMacrosDto {
  targetCalories:  number
  targetProtein:   number
  carbFatBalance?: CarbFatBalance
  presetsOnly?:    boolean
}

export interface BuildIngredientResult {
  foodId:             string
  foodName:           string
  suggestedQuantityG: number
  macros: {
    calories: number
    proteinG: number
    carbsG:   number
    fatG:     number
  }
}

export interface BuildByMacrosResult {
  mode:              'MACROS'
  targetCalories:    number
  targetProtein:     number
  achievedCalories:  number
  achievedProtein:   number
  calorieAccuracy:   number
  proteinAccuracy:   number
  ingredients:       BuildIngredientResult[]
}

export interface BuildByMicrosDto {
  microField:   string
  gapAmount:    number
  maxCalories?: number
}

export interface BuildMicroIngredientResult {
  foodId:             string
  foodName:           string
  suggestedQuantityG: number
  microContribution:  number
  macros: {
    calories: number
    proteinG: number
    carbsG:   number
    fatG:     number
  }
}

export interface BuildByMicrosResult {
  mode:            'MICROS'
  microField:      string
  gapAmount:       number
  coveredAmount:   number
  coveragePercent: number
  ingredients:     BuildMicroIngredientResult[]
}

export const recipesApi = {
  list:          ()                                     => api.get<Recipe[]>('/recipes').then(r => r.data),
  create:        (dto: CreateRecipeDto)                 => api.post<Recipe>('/recipes', dto).then(r => r.data),
  get:           (id: string)                           => api.get<Recipe>(`/recipes/${id}`).then(r => r.data),
  delete:        (id: string)                           => api.delete(`/recipes/${id}`),
  addIngredient: (id: string, dto: AddIngredientDto)    => api.post<Recipe>(`/recipes/${id}/ingredients`, dto).then(r => r.data),
  removeIngredient: (id: string, ingId: string)         => api.delete(`/recipes/${id}/ingredients/${ingId}`),

  // Paso 5.3 — constructores avanzados
  buildByMacros: (dto: BuildByMacrosDto)  => api.post<BuildByMacrosResult>('/recipes/build/macros', dto).then(r => r.data),
  buildByMicros: (dto: BuildByMicrosDto)  => api.post<BuildByMicrosResult>('/recipes/build/micros', dto).then(r => r.data),
}
