import type { Customer } from './customer'
import type { Reservation } from './reservation'
import type { Location, Vehicle } from './vehicle'

export type RentalStatusValue =
  | 'pending_checkout'
  | 'active'
  | 'pending_checkin'
  | 'completed'
  | 'cancelled'

export interface RentalStatus {
  value: RentalStatusValue
  label: string
  is_open: boolean
}

export interface RentalMileage {
  pickup: number | null
  return: number | null
  limit: number | null
  used: number | null
}

export interface RentalFuel {
  pickup_level: number | null
  return_level: number | null
}

export interface RentalPricing {
  base_amount: number
  extras_amount: number
  fees_amount: number
  taxes_amount: number
  discount_amount: number
  damage_amount: number
  extra_mileage_amount: number
  fuel_amount: number
  late_return_amount: number
  other_charges_amount: number
  total_amount: number
  deposit_amount: number
  deposit_deduction: number
  deposit_refund: number
}

export interface RentalCheckout {
  condition: Record<string, unknown> | null
  notes: string | null
  signature: string | null
  checked_out_at: string | null
}

export interface RentalCheckin {
  condition: Record<string, unknown> | null
  notes: string | null
  signature: string | null
  checked_in_at: string | null
}

export interface Rental {
  id: number
  rental_code: string
  reservation: Reservation | null
  customer: Customer
  vehicle: Vehicle
  pickup_location: Location
  return_location: Location
  planned_pickup_at: string
  planned_return_at: string
  actual_pickup_at: string | null
  actual_return_at: string | null
  status: RentalStatus
  mileage: RentalMileage
  fuel: RentalFuel
  pricing: RentalPricing
  checkout: RentalCheckout
  checkin: RentalCheckin
  created_at: string
  updated_at: string
}
