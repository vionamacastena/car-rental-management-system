import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchAdminLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  type LocationPayload,
} from '@/services/admin/locations'

const KEY = ['admin', 'locations']

export function useAdminLocations() {
  return useQuery({
    queryKey: KEY,
    queryFn: fetchAdminLocations,
  })
}

export function useCreateLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: LocationPayload) => createLocation(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useUpdateLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: LocationPayload }) =>
      updateLocation(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDeleteLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteLocation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
