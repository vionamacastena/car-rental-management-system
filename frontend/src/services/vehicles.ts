import { api } from './api'
import type { PaginatedResponse, SingleResponse } from '@/types/api'
import type { Vehicle, VehicleFilters } from '@/types/vehicle'

function buildParams(filters: VehicleFilters): Record<string, string | number | undefined> {
  const params: Record<string, string | number | undefined> = {}

  if (filters.brand) params.brand = filters.brand
  if (filters.seats) params.seats = filters.seats
  if (filters.price_min !== undefined) params.price_min = filters.price_min
  if (filters.price_max !== undefined) params.price_max = filters.price_max
  if (filters.location_id) params.location_id = filters.location_id
  if (filters.sort_by) params.sort_by = filters.sort_by
  if (filters.sort_dir) params.sort_dir = filters.sort_dir
  if (filters.page) params.page = filters.page
  if (filters.per_page) params.per_page = filters.per_page

  if (filters.fuel_type) {
    const arr = Array.isArray(filters.fuel_type) ? filters.fuel_type : [filters.fuel_type]
    arr.forEach((v, i) => { params[`fuel_type[${i}]`] = v })
  }

  if (filters.transmission) {
    const arr = Array.isArray(filters.transmission) ? filters.transmission : [filters.transmission]
    arr.forEach((v, i) => { params[`transmission[${i}]`] = v })
  }

  return params
}

export async function fetchVehicles(filters: VehicleFilters = {}): Promise<PaginatedResponse<Vehicle>> {
  const { data } = await api.get<PaginatedResponse<Vehicle>>('/vehicles', {
    params: buildParams(filters),
  })
  return data
}

export async function fetchVehicle(id: number | string): Promise<Vehicle> {
  const { data } = await api.get<SingleResponse<Vehicle>>(`/vehicles/${id}`)
  return data.data
}
