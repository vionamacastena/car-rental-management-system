import { useQuery } from '@tanstack/react-query'
import { fetchLocations } from '@/services/locations'

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
    staleTime: 1000 * 60 * 30, // lokacionet ndryshojnë rrallë
  })
}
