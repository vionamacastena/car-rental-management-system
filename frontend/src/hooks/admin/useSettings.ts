import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchSettings, updateSettings } from '@/services/admin/settings'

const KEY = ['admin', 'settings']

export function useSettings() {
  return useQuery({ queryKey: KEY, queryFn: fetchSettings })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateSettings,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
