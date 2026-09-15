import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchAdminInvoices,
  generateInvoiceFromRental,
  markInvoicePaid,
  regenerateInvoicePdf,
  downloadInvoicePdf,
  type AdminInvoiceFilters,
} from '@/services/admin/invoices'

const KEY = ['admin', 'invoices']

export function useAdminInvoices(filters: AdminInvoiceFilters = {}) {
  return useQuery({
    queryKey: [...KEY, filters],
    queryFn: () => fetchAdminInvoices(filters),
  })
}

export function useGenerateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (rentalId: number) => generateInvoiceFromRental(rentalId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useMarkInvoicePaid() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => markInvoicePaid(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useRegenerateInvoicePdf() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => regenerateInvoicePdf(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDownloadInvoicePdf() {
  return useMutation({
    mutationFn: async ({ id, number }: { id: number; number: string }) => {
      const blob = await downloadInvoicePdf(id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${number}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    },
  })
}
