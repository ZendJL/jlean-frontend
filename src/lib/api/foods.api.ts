import api from './client'

export type FoodSource     = 'internal' | 'preset' | 'usda' | 'off'
export type QualityStatus  = 'COMPLETE' | 'PARTIAL' | 'UNVERIFIED' | 'CONFLICTED'

export interface FoodResult {
  id:            string
  name:          string
  source:        FoodSource
  calories:      number
  proteinG?:     number
  carbsG?:       number
  fatG?:         number
  fiberG?:       number
  sodiumMg?:     number
  servingSizeG?: number
  qualityStatus?: QualityStatus
  sourceType?:   string
  micros?:       Record<string, number | string>
}

export interface CreateFoodDto {
  name:          string
  calories:      number
  proteinG?:     number
  carbsG?:       number
  fatG?:         number
  fiberG?:       number
  sodiumMg?:     number
  servingSizeG?: number
}

export const foodsApi = {
  search: (query: string, source: FoodSource) =>
    api.get<FoodResult[]>('/foods/search', { params: { q: query, source } }).then(r => r.data),
  detail: (id: string) =>
    api.get<FoodResult>(`/foods/${id}`).then(r => r.data),
  create: (dto: CreateFoodDto) =>
    api.post<FoodResult>('/foods', dto).then(r => r.data),
}
