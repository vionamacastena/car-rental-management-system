import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchAdminMaintenance,
  createMaintenance,
  updateMaintenance,
  cancelMaintenance,
  deleteMaintenance,
  type AdminMaintenanceFilters,
  type MaintenancePayload,
} from '@/services/admin/maintenance'

const KEY = ['admin', 'maintenance']

export function useAdminMaintenance(filters: AdminMaintenanceFilters = {}) {
  return useQuery({
    queryKey: [...KEY, filters],
    queryFn: () => fetchAdminMaintenance(filters),
  })
}

export function useCreateMaintenance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: MaintenancePayload) => createMaintenance(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
      qc.invalidateQueries({ queryKey: ['admin', 'vehicles'] })
    },
  })
}

export function useUpdateMaintenance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<MaintenancePayload> }) =>
      updateMaintenance(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
      qc.invalidateQueries({ queryKey: ['admin', 'vehicles'] })
    },
  })
}

export function useCancelMaintenance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cancelMaintenance(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
      qc.invalidateQueries({ queryKey: ['admin', 'vehicles'] })
    },
  })
}

export function useDeleteMaintenance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteMaintenance(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
