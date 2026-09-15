import { api } from './api'
import type { SingleResponse } from '@/types/api'
import type { Location } from '@/types/vehicle'

interface LocationsCollectionResponse {
  data: Location[]
}

export async function fetchLocations(): Promise<Location[]> {
  const { data } = await api.get<LocationsCollectionResponse>('/locations')
  return data.data
}

export async function fetchLocation(id: number | string): Promise<Location> {
  const { data } = await api.get<SingleResponse<Location>>(`/locations/${id}`)
  return data.data
}
