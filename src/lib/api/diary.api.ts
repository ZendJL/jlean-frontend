import api from './client'

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'OTHER'

export interface DiaryItem {
  id:        string
  name:      string
  mealType:  MealType
  quantityG: number
  calories:  number
  proteinG:  number
  carbsG:    number
  fatG:      number
}

export interface DailyLog {
  date:           string
  dayType?:       string
  targets:        { calories: number; proteinG: number; carbsG: number; fatG: number }
  totalCalories:  number
  totalProteinG:  number
  totalCarbsG:    number
  totalFatG:      number
  items:          DiaryItem[]
}

export const diaryApi = {
  today:      ()                                                    => api.get<DailyLog>('/diary/today').then(r => r.data),
  addItem:    (body: { foodId: string; mealType: MealType; quantityG: number }) =>
                api.post<DiaryItem>('/diary/items', body).then(r => r.data),
  removeItem: (itemId: string)                                      => api.delete(`/diary/items/${itemId}`),
  updateItem: (itemId: string, quantityG: number)                   =>
                api.patch<DiaryItem>(`/diary/items/${itemId}`, { quantityG }).then(r => r.data),
}
