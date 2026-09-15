import { api } from '@/services/api'
import type { PaginatedResponse, SingleResponse } from '@/types/api'
import type { Rental, RentalStatusValue } from '@/types/rental'

export interface AdminRentalFilters {
  search?: string
  status?: RentalStatusValue | RentalStatusValue[]
  vehicle_id?: number
  open_only?: boolean
  sort_by?: 'created_at' | 'planned_pickup_at' | 'planned_return_at' | 'status'
  sort_dir?: 'asc' | 'desc'
  page?: number
  per_page?: number
}

function buildParams(f: AdminRentalFilters) {
  const params: Record<string, string | number | undefined> = {}
  if (f.search) params.search = f.search
  if (f.vehicle_id) params.vehicle_id = f.vehicle_id
  if (f.open_only) params.open_only = 1
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

export async function fetchAdminRentals(f: AdminRentalFilters = {}): Promise<PaginatedResponse<Rental>> {
  const { data } = await api.get<PaginatedResponse<Rental>>('/admin/rentals', {
    params: buildParams(f),
  })
  return data
}

export async function fetchAdminRental(id: number): Promise<Rental> {
  const { data } = await api.get<SingleResponse<Rental>>(`/admin/rentals/${id}`)
  return data.data
}

export async function startRentalFromReservation(reservationId: number): Promise<Rental> {
  const { data } = await api.post<SingleResponse<Rental>>('/admin/rentals', {
    reservation_id: reservationId,
  })
  return data.data
}

export async function cancelRental(id: number): Promise<Rental> {
  const { data } = await api.post<SingleResponse<Rental>>(`/admin/rentals/${id}/cancel`)
  return data.data
}
