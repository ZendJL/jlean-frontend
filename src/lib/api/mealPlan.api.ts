import api from './client'
import { type Meal } from './diary.api'

export interface MealPlanItem {
  id:        string
  planId:    string
  date:      string
  meal:      Meal
  foodId?:   string
  recipeId?: string
  quantityG: number
  food?:     { id: string; name: string; calories: number; protein: number; carbs: number; fat: number }
  recipe?:   { id: string; name: string }
}

export interface MealPlan {
  id:        string
  name:      string
  weekStart: string
  createdAt: string
  items:     MealPlanItem[]
}

export interface CreateMealPlanDto   { name: string; weekStart: string }
export interface AddMealPlanItemDto  {
  date:      string
  meal:      Meal
  foodId?:   string
  recipeId?: string
  quantityG: number
}

export const mealPlanApi = {
  list:        ()                                        => api.get<MealPlan[]>('/meal-plans').then(r => r.data),
  getOne:      (id: string)                             => api.get<MealPlan>(`/meal-plans/${id}`).then(r => r.data),
  create:      (dto: CreateMealPlanDto)                 => api.post<MealPlan>('/meal-plans', dto).then(r => r.data),
  remove:      (id: string)                             => api.delete(`/meal-plans/${id}`).then(r => r.data),
  addItem:     (planId: string, dto: AddMealPlanItemDto) => api.post<MealPlanItem>(`/meal-plans/${planId}/items`, dto).then(r => r.data),
  removeItem:  (planId: string, itemId: string)         => api.delete(`/meal-plans/${planId}/items/${itemId}`).then(r => r.data),
  applyToLog:  (planId: string)                         => api.post(`/meal-plans/${planId}/apply-to-log`).then(r => r.data),
}
