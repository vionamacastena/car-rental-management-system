import type { Customer } from './customer'
import type { Vehicle } from './vehicle'

export type ContractStatusValue = 'draft' | 'pending_signature' | 'signed' | 'cancelled'

export interface ContractTerms {
  mileage_policy?: { description?: string; limit_km?: number; extra_km_price?: number }
  fuel_policy?: { description?: string }
  insurance?: { type?: string; deductible?: number }
  deposit?: { amount?: number; description?: string }
  late_return?: { price_per_hour?: number; description?: string }
  pickup_return?: { pickup_at?: string; return_at?: string; pickup_location?: string; return_location?: string }
  payment_terms?: { method?: string; due?: string; currency?: string }
  responsibilities?: string[]
}

export interface Contract {
  id: number
  contract_number: string
  status: {
    value: ContractStatusValue
    label: string
    is_signed: boolean
  }
  contract_version: number
  rental_id: number | null
  customer: Customer
  vehicle: Vehicle
  terms_snapshot: ContractTerms
  signatures: {
    customer_signed: boolean
    customer_signed_at: string | null
    admin_signed: boolean
    admin_signed_at: string | null
    fully_signed: boolean
  }
  has_pdf: boolean
  download_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}
