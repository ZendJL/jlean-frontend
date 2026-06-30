import api from './client'

export type Sex = 'MALE' | 'FEMALE' | 'OTHER'
export type ActivityLevel =
  | 'SEDENTARY'
  | 'LIGHTLY_ACTIVE'
  | 'MODERATELY_ACTIVE'
  | 'VERY_ACTIVE'
  | 'EXTRA_ACTIVE'
export type Goal = 'CUT' | 'MAINTAIN' | 'BULK'

export interface ProfileDto {
  sex: Sex
  birthDate: string          // ISO date YYYY-MM-DD
  weightKg: number
  heightCm: number
  activityLevel: ActivityLevel
  goal: Goal
}

export interface Profile extends ProfileDto {
  id: string
  userId: string
  bmr: number
  tdee: number
  targetCalories: number
  targetProteinG: number
  targetCarbsG: number
  targetFatG: number
}

export const profileApi = {
  get: () =>
    api.get<Profile>('/me/profile').then((r) => r.data),

  update: (dto: Partial<ProfileDto>) =>
    api.put<Profile>('/me/profile', dto).then((r) => r.data),
}