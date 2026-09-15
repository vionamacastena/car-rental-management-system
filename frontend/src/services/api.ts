import axios, { AxiosError } from 'axios'
import { env } from '@/lib/env'
import { useAuthStore } from '@/store/auth'

export const api = axios.create({
  baseURL: env.apiUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: false,
})

// Request: shto Bearer token nëse ekziston
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response: kap 401 → pastro auth + redirect në login
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const { isAuthenticated, clear } = useAuthStore.getState()
      if (isAuthenticated) {
        clear()
        if (window.location.pathname.startsWith('/admin') &&
            !window.location.pathname.startsWith('/admin/login')) {
          window.location.href = '/admin/login'
        }
      }
    }
    return Promise.reject(error)
  },
)
