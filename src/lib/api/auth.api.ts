import api from './client'

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
}

export const authApi = {
  login: (dto: LoginDto) =>
    api.post<AuthResponse>('/auth/login', dto).then((r) => r.data),

  register: (dto: RegisterDto) =>
    api.post<AuthResponse>('/auth/register', dto).then((r) => r.data),

  logout: () =>
    api.post('/auth/logout').then((r) => r.data),
}