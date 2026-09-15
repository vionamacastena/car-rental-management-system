import { api } from '@/services/api'
import type { SingleResponse } from '@/types/api'
import type { BookingPayload, Reservation } from '@/types/reservation'

export async function createBooking(payload: BookingPayload): Promise<Reservation> {
  const { data } = await api.post<SingleResponse<Reservation>>('/reservations', payload)
  return data.data
}

export async function lookupReservation(code: string, email: string): Promise<Reservation> {
  const { data } = await api.post<SingleResponse<Reservation>>('/reservations/lookup', {
    code,
    email,
  })
  return data.data
}
