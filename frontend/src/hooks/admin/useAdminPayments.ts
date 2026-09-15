import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchAdminPayments,
  createPayment,
  refundPayment,
  fetchPaymentSummary,
  type AdminPaymentFilters,
  type PaymentPayload,
  type RefundPayload,
} from '@/services/admin/payments'

const KEY = ['admin', 'payments']

export function useAdminPayments(filters: AdminPaymentFilters = {}) {
  return useQuery({
    queryKey: [...KEY, filters],
    queryFn: () => fetchAdminPayments(filters),
  })
}

export function useCreatePayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: PaymentPayload) => createPayment(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useRefundPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: RefundPayload }) =>
      refundPayment(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function usePaymentSummary(
  payableType: 'rental' | 'reservation',
  payableId: number | undefined,
) {
  return useQuery({
    queryKey: ['admin', 'payments', 'summary', payableType, payableId],
    queryFn: () => fetchPaymentSummary(payableType, payableId!),
    enabled: !!payableId,
  })
}
