import { useQuery } from '@tanstack/react-query'
import { fetchVehicles } from '@/services/vehicles'
import type { VehicleFilters } from '@/types/vehicle'

export function useVehicles(filters: VehicleFilters = {}) {
  return useQuery({
    queryKey: ['vehicles', filters],
    queryFn: () => fetchVehicles(filters),
    staleTime: 1000 * 60 * 5, // 5 min
  })
}
