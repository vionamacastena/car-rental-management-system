import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchAdminRentals,
  fetchAdminRental,
  startRentalFromReservation,
  cancelRental,
  type AdminRentalFilters,
} from '@/services/admin/rentals'

const KEY = ['admin', 'rentals']

export function useAdminRentals(filters: AdminRentalFilters = {}) {
  return useQuery({
    queryKey: [...KEY, filters],
    queryFn: () => fetchAdminRentals(filters),
  })
}

export function useAdminRental(id: number | undefined) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => fetchAdminRental(id!),
    enabled: !!id,
  })
}

export function useStartRental() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (reservationId: number) => startRentalFromReservation(reservationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
      qc.invalidateQueries({ queryKey: ['admin', 'reservations'] })
    },
  })
}

export function useCancelRental() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cancelRental(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
