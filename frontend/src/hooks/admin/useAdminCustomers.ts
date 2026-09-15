import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchAdminCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  type AdminCustomerFilters,
  type CustomerPayload,
} from '@/services/admin/customers'

const KEY = ['admin', 'customers']

export function useAdminCustomers(filters: AdminCustomerFilters = {}) {
  return useQuery({
    queryKey: [...KEY, filters],
    queryFn: () => fetchAdminCustomers(filters),
  })
}

export function useCreateCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: CustomerPayload) => createCustomer(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useUpdateCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CustomerPayload }) =>
      updateCustomer(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDeleteCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteCustomer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
