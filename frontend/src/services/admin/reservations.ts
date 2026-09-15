import { api } from '@/services/api'
import type { PaginatedResponse, SingleResponse } from '@/types/api'
import type { Reservation, ReservationStatusValue } from '@/types/reservation'

export interface AdminReservationFilters {
  search?: string
  status?: ReservationStatusValue | ReservationStatusValue[]
  vehicle_id?: number
  customer_id?: number
  upcoming?: boolean
  from?: string
  to?: string
  sort_by?: 'pickup_at' | 'return_at' | 'created_at' | 'total' | 'status'
  sort_dir?: 'asc' | 'desc'
  page?: number
  per_page?: number
}

function buildParams(f: AdminReservationFilters) {
  const params: Record<string, string | number | undefined> = {}
  if (f.search) params.search = f.search
  if (f.vehicle_id) params.vehicle_id = f.vehicle_id
  if (f.customer_id) params.customer_id = f.customer_id
  if (f.upcoming) params.upcoming = 1
  if (f.from) params.from = f.from
  if (f.to) params.to = f.to
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

export async function fetchAdminReservations(f: AdminReservationFilters = {}): Promise<PaginatedResponse<Reservation>> {
  const { data } = await api.get<PaginatedResponse<Reservation>>('/admin/reservations', {
    params: buildParams(f),
  })
  return data
}

export async function cancelReservation(id: number, reason?: string): Promise<Reservation> {
  const { data } = await api.post<SingleResponse<Reservation>>(
    `/admin/reservations/${id}/cancel`,
    { reason },
  )
  return data.data
}

export async function updateReservationStatus(id: number, status: ReservationStatusValue): Promise<Reservation> {
  const { data } = await api.patch<SingleResponse<Reservation>>(
    `/admin/reservations/${id}/status`,
    { status },
  )
  return data.data
}

export async function deleteReservation(id: number): Promise<void> {
  await api.delete(`/admin/reservations/${id}`)
}
