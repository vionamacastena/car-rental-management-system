import { api } from './api'
import type { AuthUser } from '@/store/auth'

interface LoginPayload {
  email: string
  password: string
}

interface LoginResponse {
  data: {
    user: AuthUser
    token: string
  }
}

interface MeResponse {
  data: AuthUser
}

export async function login(payload: LoginPayload) {
  const { data } = await api.post<LoginResponse>('/auth/login', payload)
  return data.data
}

export async function fetchMe(): Promise<AuthUser> {
  const { data } = await api.get<MeResponse>('/auth/me')
  return data.data
}

export async function logout() {
  await api.post('/auth/logout')
}
