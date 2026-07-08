import api from './client'

export interface WeightEntry {
  id:         string
  weightKg:   number
  note?:      string
  recordedAt: string
}

export interface WeightStats {
  minWeight: number
  maxWeight: number
  delta:     number
  count:     number
}

export interface WeightHistory {
  entries: WeightEntry[]
  stats:   WeightStats | null
}

export interface CreateWeightDto {
  weightKg:   number
  note?:      string
  recordedAt?: string
}

export const weightApi = {
  list:    (opts?: { from?: string; to?: string; limit?: number }) => {
    const params = new URLSearchParams()
    if (opts?.from)  params.set('from',  opts.from)
    if (opts?.to)    params.set('to',    opts.to)
    if (opts?.limit) params.set('limit', String(opts.limit))
    return api.get<WeightHistory>(`/weight?${params}`).then(r => r.data)
  },
  getLast: () => api.get<WeightEntry | null>('/weight/last').then(r => r.data),
  create:  (dto: CreateWeightDto) => api.post<WeightEntry>('/weight', dto).then(r => r.data),
  remove:  (id: string)           => api.delete(`/weight/${id}`).then(r => r.data),
}
