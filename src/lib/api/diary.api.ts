import api from './client'

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'OTHER'

export interface DiaryItem {
  id:        string
  foodId?:   string
  recipeId?: string
  name:      string
  quantityG: number
  mealType:  MealType
  calories:  number
  proteinG:  number
  carbsG:    number
  fatG:      number
}

export interface DailyLog {
  id:       string
  date:     string
  items:    DiaryItem[]
  totalCalories: number
  totalProteinG: number
  totalCarbsG:   number
  totalFatG:     number
}

export interface AddDiaryItemDto {
  foodId?:   string
  recipeId?: string
  quantityG: number
  mealType:  MealType
}

export const diaryApi = {
  getToday:  ()                              => api.get<DailyLog>('/diary/today').then(r => r.data),
  addItem:   (dto: AddDiaryItemDto)          => api.post<DiaryItem>('/diary/items', dto).then(r => r.data),
  removeItem:(itemId: string)                => api.delete(`/diary/items/${itemId}`),
}
