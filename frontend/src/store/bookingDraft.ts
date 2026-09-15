import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface BookingDraft {
  vehicleId: number | null

  // Step 1
  pickupLocationId: number | null
  returnLocationId: number | null
  pickupAt: string // ISO or datetime-local string
  returnAt: string

  // Step 2
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  dateOfBirth: string
  driverLicenseNumber: string
  driverLicenseExpiry: string
  notes: string

  // Anti-bot
  website: string // honeypot
}

interface BookingStore {
  draft: BookingDraft
  setDraft: (patch: Partial<BookingDraft>) => void
  reset: () => void
  setVehicle: (id: number) => void
}

const EMPTY: BookingDraft = {
  vehicleId: null,
  pickupLocationId: null,
  returnLocationId: null,
  pickupAt: '',
  returnAt: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: 'Kosovo',
  dateOfBirth: '',
  driverLicenseNumber: '',
  driverLicenseExpiry: '',
  notes: '',
  website: '',
}

export const useBookingDraft = create<BookingStore>()(
  persist(
    (set) => ({
      draft: EMPTY,
      setDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
      reset: () => set({ draft: EMPTY }),
      setVehicle: (id) => set((s) => ({ draft: { ...s.draft, vehicleId: id } })),
    }),
    {
      name: 'crms-booking-draft',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
