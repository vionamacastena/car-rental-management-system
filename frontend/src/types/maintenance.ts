import type { Vehicle } from './vehicle'

export type MaintenanceTypeValue =
  | 'oil_change' | 'tires' | 'brakes' | 'service' | 'repair'
  | 'inspection' | 'registration' | 'insurance' | 'washing'
  | 'detailing' | 'other'

export type MaintenanceStatusValue =
  | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

export interface MaintenanceRecord {
  id: number
  maintenance_code: string
  vehicle: Vehicle
  type: {
    value: MaintenanceTypeValue
    label: string
  }
  status: {
    value: MaintenanceStatusValue
    label: string
  }
  title: string
  description: string | null
  scheduled_at: string | null
  performed_at: string | null
  next_service_at: string | null
  days_until_next_service: number | null
  is_overdue: boolean
  mileage_at_service: number | null
  next_service_mileage: number | null
  cost: number
  provider_name: string | null
  provider_phone: string | null
  invoice_number: string | null
  blocks_vehicle: boolean
  created_by?: {
    id: number
    name: string
  }
  created_at: string
  updated_at: string
}
