import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchAdminVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  updateVehicleStatus,
  type AdminVehicleFilters,
  type VehiclePayload,
} from '@/services/admin/vehicles'
import type { VehicleStatusValue } from '@/types/vehicle'

const KEY = ['admin', 'vehicles']

export function useAdminVehicles(filters: AdminVehicleFilters = {}) {
  return useQuery({
    queryKey: [...KEY, filters],
    queryFn: () => fetchAdminVehicles(filters),
  })
}

export function useCreateVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: VehiclePayload) => createVehicle(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useUpdateVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: VehiclePayload }) =>
      updateVehicle(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDeleteVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteVehicle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useUpdateVehicleStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: VehicleStatusValue }) =>
      updateVehicleStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
