import api from './client'

export interface SleepEntry {
  id:           string
  bedtime:      string
  wakeTime:     string
  durationMin:  number
  qualityScore?: number
  createdAt:    string
  // enriched by getLast
  hoursSlept?:      number
  recommendation?:  string
}

export interface CreateSleepDto {
  bedtime:      string
  wakeTime:     string
  qualityScore?: number
}

export const sleepApi = {
  list:    (limit = 14)           => api.get<SleepEntry[]>(`/sleep?limit=${limit}`).then(r => r.data),
  create:  (dto: CreateSleepDto)  => api.post<SleepEntry>('/sleep', dto).then(r => r.data),
  getLast: ()                     => api.get<SleepEntry | null>('/sleep/last').then(r => r.data),
}
