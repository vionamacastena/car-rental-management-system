import { useQuery } from '@tanstack/react-query'
import {
  fetchAuditLogs,
  fetchAuditLog,
  fetchAuditActions,
  type AuditLogFilters,
} from '@/services/admin/auditLogs'

const KEY = ['admin', 'audit-logs']

export function useAuditLogs(filters: AuditLogFilters = {}) {
  return useQuery({
    queryKey: [...KEY, filters],
    queryFn: () => fetchAuditLogs(filters),
  })
}

export function useAuditLog(id: number | undefined) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => fetchAuditLog(id!),
    enabled: !!id,
  })
}

export function useAuditActions() {
  return useQuery({
    queryKey: [...KEY, 'actions'],
    queryFn: fetchAuditActions,
    staleTime: 1000 * 60 * 5,
  })
}
