import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchAdminContracts,
  fetchAdminContract,
  generateContractFromRental,
  signContract,
  downloadContractPdf,
  type AdminContractFilters,
} from '@/services/admin/contracts'

const KEY = ['admin', 'contracts']

export function useAdminContracts(filters: AdminContractFilters = {}) {
  return useQuery({
    queryKey: [...KEY, filters],
    queryFn: () => fetchAdminContracts(filters),
  })
}

export function useAdminContract(id: number | undefined) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => fetchAdminContract(id!),
    enabled: !!id,
  })
}

export function useGenerateContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (rentalId: number) => generateContractFromRental(rentalId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useSignContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, party, signature }: { id: number; party: 'customer' | 'admin'; signature: string }) =>
      signContract(id, party, signature),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDownloadContractPdf() {
  return useMutation({
    mutationFn: ({ id, number }: { id: number; number: string }) =>
      downloadContractPdf(id, number),
  })
}
