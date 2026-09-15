import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchAdminReservations,
  cancelReservation,
  updateReservationStatus,
  deleteReservation,
  type AdminReservationFilters,
} from '@/services/admin/reservations'
import type { ReservationStatusValue } from '@/types/reservation'

const KEY = ['admin', 'reservations']

export function useAdminReservations(filters: AdminReservationFilters = {}) {
  return useQuery({
    queryKey: [...KEY, filters],
    queryFn: () => fetchAdminReservations(filters),
  })
}

export function useCancelReservation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      cancelReservation(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useUpdateReservationStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: ReservationStatusValue }) =>
      updateReservationStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDeleteReservation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteReservation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
