import api from './client'

export type FoodSource = 'internal' | 'preset' | 'usda' | 'off'
export type QualityStatus = 'COMPLETE' | 'PARTIAL' | 'UNVERIFIED' | 'CONFLICTED'

export interface FoodResult {
  id:            string
  name:          string
  calories:      number
  proteinG:      number
  carbsG:        number
  fatG:          number
  fiberG?:       number
  source:        FoodSource
  qualityStatus?: QualityStatus
  servingSize?:  number
  servingUnit?:  string
}

export interface FoodDetail extends FoodResult {
  sodiumMg?:     number
  calciumMg?:    number
  ironMg?:       number
  magnesiumMg?:  number
  potassiumMg?:  number
  vitaminCMg?:   number
  vitaminDMcg?:  number
  vitaminB12Mcg?: number
  caffeineMg?:   number
  alcoholG?:     number
}

export interface FoodSearchParams {
  q:      string
  source?: FoodSource
  limit?:  number
}

export const foodsApi = {
  search: (params: FoodSearchParams) =>
    api.get<FoodResult[]>('/foods/search', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<FoodDetail>(`/foods/${id}`).then((r) => r.data),
}
