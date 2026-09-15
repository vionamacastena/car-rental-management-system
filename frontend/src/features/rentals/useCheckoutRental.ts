import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '@/services/api'
import type { SingleResponse } from '@/types/api'
import type { Rental } from '@/types/rental'

export interface CheckoutPayload {
  pickup_mileage: number
  pickup_fuel_level: number
  checkout_condition?: {
    exterior?: 'good' | 'minor_scratches' | 'damaged'
    interior?: 'clean' | 'minor_dirt' | 'damaged'
    existing_damages?: string[]
  }
  checkout_notes?: string
  checkout_signature?: string
}

export function useCheckoutRental(rentalId: number) {
  const qc = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (payload: CheckoutPayload) => {
      const { data } = await api.post<SingleResponse<Rental>>(
        `/admin/rentals/${rentalId}/checkout`,
        payload,
      )
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'rentals'] })
      qc.invalidateQueries({ queryKey: ['admin', 'vehicles'] })
      qc.invalidateQueries({ queryKey: ['admin', 'reservations'] })
      navigate('/admin/rentals')
    },
  })
}
