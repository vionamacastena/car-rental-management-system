import axios from 'axios'
import { env } from '@/lib/env'

export const api = axios.create({
  baseURL: env.apiUrl,
  headers: { Accept: 'application/json' },
  withCredentials: true,
})
