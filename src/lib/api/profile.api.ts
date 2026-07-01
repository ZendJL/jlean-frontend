import api from './client'

export type Gender        = 'MALE' | 'FEMALE'
export type ActivityLevel =
  | 'SEDENTARY'
  | 'LIGHTLY_ACTIVE'
  | 'MODERATELY_ACTIVE'
  | 'VERY_ACTIVE'
  | 'EXTRA_ACTIVE'
// Valores que usa el schema Prisma (Goal enum)
export type Goal = 'LOSE' | 'MAINTAIN' | 'GAIN'

export interface ProfileDto {
  gender:        Gender
  birthDate:     string        // YYYY-MM-DD
  weightKg:      number
  heightCm:      number
  activityLevel: ActivityLevel
  goal:          Goal
}

export interface Profile extends ProfileDto {
  id:            string
  userId:        string
  calorieTarget: number
  proteinTarget: number
  carbTarget:    number
  fatTarget:     number
}

export interface UserGoal {
  id:            string
  userId:        string
  calorieTarget: number
  proteinTarget: number
  carbTarget:    number
  fatTarget:     number
  goal:          Goal
  activityLevel: ActivityLevel
  effectiveFrom: string
  effectiveTo:   string | null
}

export interface DailySummary {
  date:      string
  targets:   { calories: number; protein: number; carbs: number; fat: number }
  consumed:  { calories: number; protein: number; carbs: number; fat: number }
  remaining: { calories: number; protein: number; carbs: number; fat: number }
}

export const profileApi = {
  get: () =>
    api.get<Profile>('/me/profile').then((r) => r.data),

  update: (dto: Partial<ProfileDto>) =>
    api.put<Profile>('/me/profile', dto).then((r) => r.data),

  // Paso 3.3 — historial de metas
  getGoalHistory: () =>
    api.get<UserGoal[]>('/me/goals').then((r) => r.data),

  // Resumen diario de consumo vs targets
  getDaily: () =>
    api.get<DailySummary>('/me/daily').then((r) => r.data),
}
