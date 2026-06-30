import { create } from 'zustand'

interface User {
  id: string
  email: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  setAuth: (accessToken: string, refreshToken: string) => void
  clearAuth: () => void
}

function decodeJwt(token: string): User | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return { id: payload.sub, email: payload.email }
  } catch {
    return null
  }
}

// Leer token guardado al inicializar
function getInitialState(): Pick<AuthState, 'user' | 'accessToken'> {
  if (typeof window === 'undefined') return { user: null, accessToken: null }
  const token = localStorage.getItem('access_token')
  if (!token) return { user: null, accessToken: null }
  return { user: decodeJwt(token), accessToken: token }
}

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),

  setAuth: (accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('refresh_token', refreshToken)
    }
    set({ user: decodeJwt(accessToken), accessToken })
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
    set({ user: null, accessToken: null })
  },
}))