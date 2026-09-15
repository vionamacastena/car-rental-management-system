import { api } from '@/services/api'
import type { PaginatedResponse, SingleResponse } from '@/types/api'
import type { Vehicle, VehicleStatusValue, FuelTypeValue, TransmissionValue } from '@/types/vehicle'

export interface AdminVehicleFilters {
  search?: string
  status?: VehicleStatusValue
  fuel_type?: FuelTypeValue
  transmission?: TransmissionValue
  location_id?: number
  sort_by?: 'brand' | 'year' | 'daily_price' | 'mileage' | 'created_at' | 'status'
  sort_dir?: 'asc' | 'desc'
  page?: number
  per_page?: number
}

export interface VehiclePayload {
  brand: string
  model: string
  year: number
  license_plate: string
  vin?: string | null
  color?: string | null
  mileage: number
  fuel_type: FuelTypeValue
  transmission: TransmissionValue
  seats: number
  current_location_id?: number | null
  status: VehicleStatusValue
  daily_price: number
  purchase_price?: number | null
  current_value?: number | null
  description?: string | null
  features?: string[]
}

function buildParams(filters: AdminVehicleFilters): Record<string, string | number | undefined> {
  const params: Record<string, string | number | undefined> = {}
  if (filters.search) params.search = filters.search
  if (filters.status) params.status = filters.status
  if (filters.fuel_type) params.fuel_type = filters.fuel_type
  if (filters.transmission) params.transmission = filters.transmission
  if (filters.location_id) params.location_id = filters.location_id
  if (filters.sort_by) params.sort_by = filters.sort_by
  if (filters.sort_dir) params.sort_dir = filters.sort_dir
  if (filters.page) params.page = filters.page
  if (filters.per_page) params.per_page = filters.per_page
  return params
}

export async function fetchAdminVehicles(filters: AdminVehicleFilters = {}): Promise<PaginatedResponse<Vehicle>> {
  const { data } = await api.get<PaginatedResponse<Vehicle>>('/admin/vehicles', {
    params: buildParams(filters),
  })
  return data
}

export async function createVehicle(payload: VehiclePayload): Promise<Vehicle> {
  const { data } = await api.post<SingleResponse<Vehicle>>('/admin/vehicles', payload)
  return data.data
}

export async function updateVehicle(id: number, payload: VehiclePayload): Promise<Vehicle> {
  const { data } = await api.put<SingleResponse<Vehicle>>(`/admin/vehicles/${id}`, payload)
  return data.data
}

export async function deleteVehicle(id: number): Promise<void> {
  await api.delete(`/admin/vehicles/${id}`)
}

export async function updateVehicleStatus(id: number, status: VehicleStatusValue): Promise<Vehicle> {
  const { data } = await api.patch<SingleResponse<Vehicle>>(`/admin/vehicles/${id}/status`, { status })
  return data.data
}
