import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { createBooking } from '@/services/reservations'
import { useBookingDraft } from '@/store/bookingDraft'
import type { Reservation } from '@/types/reservation'

export function useCreateBooking() {
  const navigate = useNavigate()
  const reset = useBookingDraft((s) => s.reset)

  return useMutation({
    mutationFn: createBooking,
    onSuccess: (reservation: Reservation) => {
      reset()
      navigate(`/confirmation/${reservation.reservation_code}`, {
        state: { reservation },
        replace: true,
      })
    },
  })
}
