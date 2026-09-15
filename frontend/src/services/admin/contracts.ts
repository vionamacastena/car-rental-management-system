import { api } from '@/services/api'
import type { PaginatedResponse, SingleResponse } from '@/types/api'
import type { Contract, ContractStatusValue } from '@/types/contract'

export interface AdminContractFilters {
  search?: string
  status?: ContractStatusValue
  rental_id?: number
  customer_id?: number
  page?: number
  per_page?: number
}

function buildParams(f: AdminContractFilters) {
  const params: Record<string, string | number | undefined> = {}
  if (f.search) params.search = f.search
  if (f.status) params.status = f.status
  if (f.rental_id) params.rental_id = f.rental_id
  if (f.customer_id) params.customer_id = f.customer_id
  if (f.page) params.page = f.page
  if (f.per_page) params.per_page = f.per_page
  return params
}

export async function fetchAdminContracts(f: AdminContractFilters = {}): Promise<PaginatedResponse<Contract>> {
  const { data } = await api.get<PaginatedResponse<Contract>>('/admin/contracts', {
    params: buildParams(f),
  })
  return data
}

export async function fetchAdminContract(id: number): Promise<Contract> {
  const { data } = await api.get<SingleResponse<Contract>>(`/admin/contracts/${id}`)
  return data.data
}

export async function generateContractFromRental(rentalId: number): Promise<Contract> {
  const { data } = await api.post<SingleResponse<Contract>>('/admin/contracts', {
    rental_id: rentalId,
  })
  return data.data
}

export async function signContract(
  id: number,
  party: 'customer' | 'admin',
  signature: string,
): Promise<Contract> {
  const { data } = await api.post<SingleResponse<Contract>>(
    `/admin/contracts/${id}/sign-${party}`,
    { party, signature },
  )
  return data.data
}

export async function downloadContractPdf(id: number, number: string): Promise<void> {
  const { data } = await api.get(`/admin/contracts/${id}/pdf`, {
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(data as Blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${number}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}
