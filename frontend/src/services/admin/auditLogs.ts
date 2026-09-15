import { api } from '@/services/api'
import type { PaginatedResponse, SingleResponse } from '@/types/api'
import type { AuditLogEntry } from '@/types/auditLog'

export interface AuditLogFilters {
  search?: string
  action?: string
  entity_type?: string
  user_id?: number
  from?: string
  to?: string
  page?: number
  per_page?: number
}

function buildParams(f: AuditLogFilters) {
  const params: Record<string, string | number | undefined> = {}
  if (f.search) params.search = f.search
  if (f.action) params.action = f.action
  if (f.entity_type) params.entity_type = f.entity_type
  if (f.user_id) params.user_id = f.user_id
  if (f.from) params.from = f.from
  if (f.to) params.to = f.to
  if (f.page) params.page = f.page
  if (f.per_page) params.per_page = f.per_page
  return params
}

export async function fetchAuditLogs(f: AuditLogFilters = {}): Promise<PaginatedResponse<AuditLogEntry>> {
  const { data } = await api.get<PaginatedResponse<AuditLogEntry>>('/admin/audit-logs', {
    params: buildParams(f),
  })
  return data
}

export async function fetchAuditLog(id: number): Promise<AuditLogEntry> {
  const { data } = await api.get<SingleResponse<AuditLogEntry>>(`/admin/audit-logs/${id}`)
  return data.data
}

export async function fetchAuditActions(): Promise<string[]> {
  const { data } = await api.get<{ data: string[] }>('/admin/audit-logs/actions')
  return data.data
}
