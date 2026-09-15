import { api } from '@/services/api'
import type { SingleResponse } from '@/types/api'
import type { Location } from '@/types/vehicle'

interface LocationsCollectionResponse {
  data: Location[]
}

export interface LocationPayload {
  name: string
  address: string
  city: string
  phone?: string | null
  email?: string | null
  opening_hours?: Record<string, string> | null
  is_active?: boolean
}

export async function fetchAdminLocations(): Promise<Location[]> {
  const { data } = await api.get<LocationsCollectionResponse>('/admin/locations')
  return data.data
}

export async function createLocation(payload: LocationPayload): Promise<Location> {
  const { data } = await api.post<SingleResponse<Location>>('/admin/locations', payload)
  return data.data
}

export async function updateLocation(id: number, payload: LocationPayload): Promise<Location> {
  const { data } = await api.put<SingleResponse<Location>>(`/admin/locations/${id}`, payload)
  return data.data
}

export async function deleteLocation(id: number): Promise<void> {
  await api.delete(`/admin/locations/${id}`)
}
