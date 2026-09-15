import { api } from '@/services/api'
import type { PaginatedResponse, SingleResponse } from '@/types/api'
import type { MaintenanceRecord, MaintenanceStatusValue, MaintenanceTypeValue } from '@/types/maintenance'

export interface AdminMaintenanceFilters {
  search?: string
  status?: MaintenanceStatusValue | MaintenanceStatusValue[]
  type?: MaintenanceTypeValue
  vehicle_id?: number
  overdue?: boolean
  upcoming_service?: boolean
  sort_by?: 'created_at' | 'scheduled_at' | 'next_service_at' | 'cost'
  sort_dir?: 'asc' | 'desc'
  page?: number
  per_page?: number
}

export interface MaintenancePayload {
  vehicle_id: number
  type: MaintenanceTypeValue
  status?: MaintenanceStatusValue
  title: string
  description?: string | null
  scheduled_at?: string | null
  performed_at?: string | null
  next_service_at?: string | null
  mileage_at_service?: number | null
  next_service_mileage?: number | null
  cost?: number | null
  provider_name?: string | null
  provider_phone?: string | null
  invoice_number?: string | null
  blocks_vehicle?: boolean
}

function buildParams(f: AdminMaintenanceFilters) {
  const params: Record<string, string | number | undefined> = {}
  if (f.search) params.search = f.search
  if (f.type) params.type = f.type
  if (f.vehicle_id) params.vehicle_id = f.vehicle_id
  if (f.overdue) params.overdue = 1
  if (f.upcoming_service) params.upcoming_service = 1
  if (f.sort_by) params.sort_by = f.sort_by
  if (f.sort_dir) params.sort_dir = f.sort_dir
  if (f.page) params.page = f.page
  if (f.per_page) params.per_page = f.per_page

  if (f.status) {
    const arr = Array.isArray(f.status) ? f.status : [f.status]
    arr.forEach((v, i) => { params[`status[${i}]`] = v })
  }

  return params
}

export async function fetchAdminMaintenance(f: AdminMaintenanceFilters = {}): Promise<PaginatedResponse<MaintenanceRecord>> {
  const { data } = await api.get<PaginatedResponse<MaintenanceRecord>>('/admin/maintenance', {
    params: buildParams(f),
  })
  return data
}

export async function createMaintenance(payload: MaintenancePayload): Promise<MaintenanceRecord> {
  const { data } = await api.post<SingleResponse<MaintenanceRecord>>('/admin/maintenance', payload)
  return data.data
}

export async function updateMaintenance(id: number, payload: Partial<MaintenancePayload>): Promise<MaintenanceRecord> {
  const { data } = await api.put<SingleResponse<MaintenanceRecord>>(`/admin/maintenance/${id}`, payload)
  return data.data
}

export async function cancelMaintenance(id: number): Promise<MaintenanceRecord> {
  const { data } = await api.post<SingleResponse<MaintenanceRecord>>(`/admin/maintenance/${id}/cancel`)
  return data.data
}

export async function deleteMaintenance(id: number): Promise<void> {
  await api.delete(`/admin/maintenance/${id}`)
}
