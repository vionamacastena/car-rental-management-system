import { api } from '@/services/api'
import type { PaginatedResponse, SingleResponse } from '@/types/api'
import type { Invoice, InvoiceStatusValue } from '@/types/invoice'

export interface AdminInvoiceFilters {
  search?: string
  status?: InvoiceStatusValue
  rental_id?: number
  customer_id?: number
  page?: number
  per_page?: number
}

function buildParams(f: AdminInvoiceFilters) {
  const params: Record<string, string | number | undefined> = {}
  if (f.search) params.search = f.search
  if (f.status) params.status = f.status
  if (f.rental_id) params.rental_id = f.rental_id
  if (f.customer_id) params.customer_id = f.customer_id
  if (f.page) params.page = f.page
  if (f.per_page) params.per_page = f.per_page
  return params
}

export async function fetchAdminInvoices(f: AdminInvoiceFilters = {}): Promise<PaginatedResponse<Invoice>> {
  const { data } = await api.get<PaginatedResponse<Invoice>>('/admin/invoices', {
    params: buildParams(f),
  })
  return data
}

export async function generateInvoiceFromRental(rentalId: number): Promise<Invoice> {
  const { data } = await api.post<SingleResponse<Invoice>>('/admin/invoices', {
    rental_id: rentalId,
  })
  return data.data
}

export async function markInvoicePaid(invoiceId: number): Promise<Invoice> {
  const { data } = await api.post<SingleResponse<Invoice>>(`/admin/invoices/${invoiceId}/mark-paid`)
  return data.data
}

export async function regenerateInvoicePdf(invoiceId: number): Promise<Invoice> {
  const { data } = await api.post<SingleResponse<Invoice>>(`/admin/invoices/${invoiceId}/regenerate`)
  return data.data
}

/**
 * Shkarko PDF me auth header (sepse endpoint kërkon Bearer).
 */
export async function downloadInvoicePdf(invoiceId: number): Promise<Blob> {
  const { data } = await api.get(`/admin/invoices/${invoiceId}/pdf`, {
    responseType: 'blob',
  })
  return data as Blob
}
