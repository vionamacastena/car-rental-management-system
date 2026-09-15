import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '@/services/api'
import type { SingleResponse } from '@/types/api'
import type { Rental } from '@/types/rental'

export interface NewDamage {
  area: string
  type: string
  severity?: 'minor' | 'moderate' | 'severe'
  description?: string
  estimated_cost?: number
}

export interface CheckinPayload {
  return_mileage: number
  return_fuel_level: number
  checkin_condition?: {
    exterior?: 'good' | 'minor_scratches' | 'damaged'
    interior?: 'clean' | 'minor_dirt' | 'damaged'
    new_damages?: NewDamage[]
  }
  checkin_notes?: string
  checkin_signature?: string
  fuel_charge?: number
  damage_charge?: number
  extra_mileage_charge?: number
  late_return_charge?: number
  other_charges?: number
  deposit_deduction?: number
  deposit_refund?: number
}

export function useCheckinRental(rentalId: number) {
  const qc = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (payload: CheckinPayload) => {
      const { data } = await api.post<SingleResponse<Rental>>(
        `/admin/rentals/${rentalId}/checkin`,
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
