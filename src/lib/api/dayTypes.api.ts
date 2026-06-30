import api from './client'

export interface DayType {
  id: string
  name: string
  tdeAdjustPct: number
  color?: string
  isDefault?: boolean
}

export interface DayAssignment {
  id: string
  date: string
  dayTypeId: string
  dayType: DayType
}

export const dayTypesApi = {
  getAll: (): Promise<DayType[]> =>
    api.get('/day-types').then((r) => r.data),

  create: (dto: { name: string; tdeAdjustPct: number; color?: string }): Promise<DayType> =>
    api.post('/day-types', dto).then((r) => r.data),

  update: (id: string, dto: Partial<Pick<DayType, 'name' | 'tdeAdjustPct' | 'color'>>): Promise<DayType> =>
    api.patch(`/day-types/${id}`, dto).then((r) => r.data),

  remove: (id: string): Promise<void> =>
    api.delete(`/day-types/${id}`).then((r) => r.data),

  assignToDate: (dayTypeId: string, date: string): Promise<DayAssignment> =>
    api.post('/day-types/assign', { dayTypeId, date }).then((r) => r.data),

  removeAssignment: (date: string): Promise<void> =>
    api.delete(`/day-types/assign/${date}`).then((r) => r.data),

  getTodayAssignment: (): Promise<DayAssignment | null> =>
    api.get('/day-types/today').then((r) => r.data),
}
