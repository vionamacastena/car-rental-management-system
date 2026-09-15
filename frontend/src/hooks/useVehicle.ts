import { useQuery } from '@tanstack/react-query'
import { fetchVehicle } from '@/services/vehicles'

export function useVehicle(id: number | string | undefined) {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => fetchVehicle(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}
