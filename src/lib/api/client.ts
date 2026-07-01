import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
})

// Inyectar token en cada request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Manejar respuestas de error globalmente
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status

    // 401 — sesión expirada, limpiar y redirigir
    if (status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
    }

    // 429 — propagar con metadatos para que los componentes muestren banner
    if (status === 429) {
      const retryAfter = error.response?.headers?.['retry-after']
      error.isRateLimited = true
      error.retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : 60
    }

    // 503 / red caída — marcar para fallback visual
    if (!error.response || status >= 500) {
      error.isServiceUnavailable = true
    }

    return Promise.reject(error)
  },
)

export default api
