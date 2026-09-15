import { api } from '@/services/api'
import type { PaginatedResponse, SingleResponse } from '@/types/api'
import type {
  Payment,
  PaymentSummary,
  PaymentTypeValue,
  PaymentMethodValue,
  PaymentStatusValue,
} from '@/types/payment'

export interface AdminPaymentFilters {
  search?: string
  type?: PaymentTypeValue | PaymentTypeValue[]
  method?: PaymentMethodValue
  status?: PaymentStatusValue
  customer_id?: number
  payable_type?: 'rental' | 'reservation'
  payable_id?: number
  page?: number
  per_page?: number
}

export interface PaymentPayload {
  payable_type: 'rental' | 'reservation'
  payable_id: number
  type: PaymentTypeValue
  method: PaymentMethodValue
  amount: number
  reference?: string | null
  notes?: string | null
  paid_at?: string | null
}

export interface RefundPayload {
  amount: number
  method?: PaymentMethodValue
  reference?: string | null
  notes?: string | null
}

function buildParams(f: AdminPaymentFilters) {
  const params: Record<string, string | number | undefined> = {}
  if (f.search) params.search = f.search
  if (f.method) params.method = f.method
  if (f.status) params.status = f.status
  if (f.customer_id) params.customer_id = f.customer_id
  if (f.payable_type) params.payable_type = f.payable_type
  if (f.payable_id) params.payable_id = f.payable_id
  if (f.page) params.page = f.page
  if (f.per_page) params.per_page = f.per_page

  if (f.type) {
    const arr = Array.isArray(f.type) ? f.type : [f.type]
    arr.forEach((v, i) => { params[`type[${i}]`] = v })
  }

  return params
}

export async function fetchAdminPayments(f: AdminPaymentFilters = {}): Promise<PaginatedResponse<Payment>> {
  const { data } = await api.get<PaginatedResponse<Payment>>('/admin/payments', {
    params: buildParams(f),
  })
  return data
}

export async function createPayment(payload: PaymentPayload): Promise<Payment> {
  const { data } = await api.post<SingleResponse<Payment>>('/admin/payments', payload)
  return data.data
}

export async function refundPayment(paymentId: number, payload: RefundPayload): Promise<Payment> {
  const { data } = await api.post<SingleResponse<Payment>>(`/admin/payments/${paymentId}/refund`, payload)
  return data.data
}

export async function fetchPaymentSummary(payableType: 'rental' | 'reservation', payableId: number): Promise<PaymentSummary> {
  const { data } = await api.get<{ data: PaymentSummary }>('/admin/payments/summary', {
    params: { payable_type: payableType, payable_id: payableId },
  })
  return data.data
}
