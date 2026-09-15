import type { Customer } from './customer'
import type { Location, Vehicle } from './vehicle'

export type ReservationStatusValue =
  | 'inquiry' | 'reserved' | 'picked_up' | 'active' | 'returned'
  | 'completed' | 'cancelled' | 'no_show' | 'overdue'

export type ReservationSourceValue = 'public' | 'admin'

export interface ReservationStatus {
  value: ReservationStatusValue
  label: string
  is_blocking: boolean
}

export interface ReservationSource {
  value: ReservationSourceValue
  label: string
}

export interface ReservationPricing {
  daily_price_snapshot: number
  subtotal: number
  extras_total: number
  fees_total: number
  taxes_total: number
  discount_total: number
  total: number
  deposit_amount: number
}

export interface Reservation {
  id: number
  reservation_code: string
  customer: Customer
  vehicle: Vehicle
  pickup_location: Location
  return_location: Location
  pickup_at: string
  return_at: string
  days: number
  pricing: ReservationPricing
  status: ReservationStatus
  source: ReservationSource
  notes: string | null
  internal_notes: string | null
  cancelled_at: string | null
  cancelled_reason: string | null
  created_at: string
  updated_at: string
}

export interface BookingPayload {
  vehicle_id: number
  pickup_location_id: number
  return_location_id: number
  pickup_at: string
  return_at: string
  first_name: string
  last_name: string
  email: string
  phone: string
  address?: string
  city?: string
  country?: string
  date_of_birth?: string
  driver_license_number?: string
  driver_license_expiry?: string
  notes?: string
  website?: string // honeypot
}
