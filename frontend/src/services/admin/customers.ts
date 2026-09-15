import { api } from '@/services/api'
import type { PaginatedResponse, SingleResponse } from '@/types/api'
import type { Customer } from '@/types/customer'

export interface AdminCustomerFilters {
  search?: string
  sort_by?: 'created_at' | 'first_name' | 'last_name' | 'email'
  sort_dir?: 'asc' | 'desc'
  page?: number
  per_page?: number
}

export interface CustomerPayload {
  first_name: string
  last_name: string
  email: string
  phone: string
  address?: string | null
  city?: string | null
  country?: string | null
  date_of_birth?: string | null
  driver_license_number?: string | null
  driver_license_expiry?: string | null
  notes?: string | null
}

function buildParams(f: AdminCustomerFilters) {
  const params: Record<string, string | number | undefined> = {}
  if (f.search) params.search = f.search
  if (f.sort_by) params.sort_by = f.sort_by
  if (f.sort_dir) params.sort_dir = f.sort_dir
  if (f.page) params.page = f.page
  if (f.per_page) params.per_page = f.per_page
  return params
}

export async function fetchAdminCustomers(f: AdminCustomerFilters = {}): Promise<PaginatedResponse<Customer>> {
  const { data } = await api.get<PaginatedResponse<Customer>>('/admin/customers', {
    params: buildParams(f),
  })
  return data
}

export async function createCustomer(p: CustomerPayload): Promise<Customer> {
  const { data } = await api.post<SingleResponse<Customer>>('/admin/customers', p)
  return data.data
}

export async function updateCustomer(id: number, p: CustomerPayload): Promise<Customer> {
  const { data } = await api.put<SingleResponse<Customer>>(`/admin/customers/${id}`, p)
  return data.data
}

export async function deleteCustomer(id: number): Promise<void> {
  await api.delete(`/admin/customers/${id}`)
}
