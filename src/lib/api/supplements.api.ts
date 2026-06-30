import api from './client'

export interface Supplement {
  id:               string
  name:             string
  doseAmount:       number
  doseUnit:         string
  frequency?:       string
  timing?:          string
  notes?:           string
  caffeinePerDoseMg?: number
  active:           boolean
}

export interface SupplementLog {
  id:           string
  supplementId: string
  takenAt:      string
  notes?:       string
  supplement:   Supplement
}

export interface CreateSupplementDto {
  name:             string
  doseAmount:       number
  doseUnit:         string
  frequency?:       string
  timing?:          string
  notes?:           string
  caffeinePerDoseMg?: number
}

export const supplementsApi = {
  list:      ()                              => api.get<Supplement[]>('/supplements').then(r => r.data),
  create:    (dto: CreateSupplementDto)      => api.post<Supplement>('/supplements', dto).then(r => r.data),
  remove:    (id: string)                    => api.delete(`/supplements/${id}`),
  log:       (supplementId: string)          => api.post<SupplementLog>('/supplements/log', { supplementId }).then(r => r.data),
  todayLogs: ()                              => api.get<SupplementLog[]>('/supplements/log/today').then(r => r.data),
}
