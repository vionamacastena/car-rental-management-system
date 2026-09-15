export interface Customer {
  id: number
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone: string
  address: string | null
  city: string | null
  country: string | null
  date_of_birth: string | null
  driver_license_number: string | null
  driver_license_expiry: string | null
  notes: string | null
  created_at: string
  updated_at: string
}
