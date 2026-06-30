import api from './client'

export interface FastingConfig {
  fastHours:    number
  eatHours:     number
  eatStartHour: number
  active:       boolean
}

export interface FastingStatus {
  active:          boolean
  fasting:         boolean
  inEatingWindow:  boolean
  windowLabel:     string
  eatStartHour:    number
  eatEndHour:      number
  message:         string
}

export const fastingApi = {
  getConfig: ()                    => api.get<FastingConfig | null>('/fasting').then(r => r.data),
  setConfig: (dto: FastingConfig)  => api.post<FastingConfig>('/fasting', dto).then(r => r.data),
  getStatus: ()                    => api.get<FastingStatus>('/fasting/status').then(r => r.data),
}
