export type FuelTypeValue = 'petrol' | 'diesel' | 'electric' | 'hybrid'
export type TransmissionValue = 'manual' | 'automatic'
export type VehicleStatusValue =
  | 'available' | 'reserved' | 'rented' | 'cleaning'
  | 'maintenance' | 'damaged' | 'out_of_service' | 'sold'

export interface EnumOption<T extends string = string> {
  value: T
  label: string
}

export interface VehiclePhoto {
  id: number
  path: string
  url: string
  is_primary: boolean
  sort_order: number
}

export interface Location {
  id: number
  name: string
  address: string
  city: string
  phone: string | null
  email: string | null
  opening_hours: Record<string, string> | null
  is_active: boolean
  vehicles_count?: number
}

export interface Vehicle {
  id: number
  brand: string
  model: string
  full_name: string
  year: number
  license_plate: string
  vin?: string
  color: string | null
  mileage: number
  fuel_type: EnumOption<FuelTypeValue>
  transmission: EnumOption<TransmissionValue>
  seats: number
  status: EnumOption<VehicleStatusValue>
  daily_price: number
  description: string | null
  features: string[]
  location?: Location
  photos: VehiclePhoto[]
  primary_photo?: VehiclePhoto
  created_at: string
}

export interface VehicleFilters {
  brand?: string
  fuel_type?: FuelTypeValue | FuelTypeValue[]
  transmission?: TransmissionValue | TransmissionValue[]
  seats?: number
  price_min?: number
  price_max?: number
  location_id?: number
  sort_by?: 'daily_price' | 'year' | 'brand' | 'mileage'
  sort_dir?: 'asc' | 'desc'
  page?: number
  per_page?: number
}
