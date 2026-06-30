import api from './client'

export interface MacroTotals {
  calories: number
  proteinG: number
  carbsG:   number
  fatG:     number
  fiberG?:  number
}

export interface MealItem {
  id:        string
  foodName:  string
  quantityG: number
  calories:  number
  proteinG:  number
  carbsG:    number
  fatG:      number
  mealType:  string
}

export interface MealSummary {
  calories: number
  proteinG: number
  carbsG:   number
  fatG:     number
  items:    MealItem[]
}

export interface DashboardToday {
  date:      string
  targets:   MacroTotals
  consumed:  MacroTotals
  remaining: MacroTotals
  progress:  { calories: number; proteinG: number; carbsG: number; fatG: number }
  meals:     Record<string, MealSummary>
  insights:  string[]
  profile:   { weightKg: number; heightCm: number; activityLevel: string; goal: string } | null
}

export const dashboardApi = {
  today: () => api.get<DashboardToday>('/dashboard/today').then((r) => r.data),
}
