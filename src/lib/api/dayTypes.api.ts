/**
 * Paso 3.4 — Cliente API para tipos de día y ajuste dinámico de TDEE.
 * Endpoints base: /day-types
 */
import api from './client'

export interface DayType {
  id:            string
  userId:        string
  name:          string
  tdeAdjustPct:  number  // ej: -15 para Rest, +15 para Training
  color:         string | null
  isDefault:     boolean
}

export interface DayAssignment {
  id:        string
  userId:    string
  dayTypeId: string
  date:      string      // ISO string
  dayType:   DayType
}

export interface AdjustedTargets {
  base: {
    calories: number
    protein:  number
    carbs:    number
    fat:      number
  }
  dayType: DayType | null
  factor:  number
  adjusted: {
    calories: number
    protein:  number
    carbs:    number
    fat:      number
  }
}

export const dayTypesApi = {
  // ─── CRUD ────────────────────────────────────────────────────────────────

  getAll: () =>
    api.get<DayType[]>('/day-types').then((r) => r.data),

  create: (dto: { name: string; tdeAdjustPct: number; color?: string }) =>
    api.post<DayType>('/day-types', dto).then((r) => r.data),

  update: (id: string, dto: { name?: string; tdeAdjustPct?: number; color?: string }) =>
    api.put<DayType>(`/day-types/${id}`, dto).then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/day-types/${id}`).then((r) => r.data),

  // ─── Asignación ─────────────────────────────────────────────────────────

  // Asigna un tipo de día a una fecha (default: hoy)
  assign: (dayTypeId: string, date?: string) => {
    const d = date ?? new Date().toISOString().split('T')[0]
    return api.post<DayAssignment>(`/day-types/assign?date=${d}`, { dayTypeId }).then((r) => r.data)
  },

  removeAssignment: (date?: string) => {
    const d = date ?? new Date().toISOString().split('T')[0]
    return api.delete(`/day-types/assign?date=${d}`).then((r) => r.data)
  },

  // ─── Consultas ───────────────────────────────────────────────────────────

  // Tipo de día asignado hoy
  getToday: () =>
    api.get<DayAssignment | null>('/day-types/today').then((r) => r.data),

  // TDEE ajustado para una fecha (default: hoy)
  getTargets: (date?: string) => {
    const d = date ?? new Date().toISOString().split('T')[0]
    return api.get<AdjustedTargets>(`/day-types/targets?date=${d}`).then((r) => r.data)
  },
}
