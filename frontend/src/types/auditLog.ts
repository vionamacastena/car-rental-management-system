export type AuditAction =
  | 'created' | 'updated' | 'deleted'
  | 'status_changed' | 'cancelled' | 'signed' | 'refunded'
  | 'checkin' | 'checkout' | string

export interface AuditLogEntry {
  id: number
  action: AuditAction
  entity: {
    type: string
    short_name: string
    id: number | null
    label: string | null
  }
  user: {
    id: number | null
    name: string | null
    email: string | null
  }
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  changed_fields: Record<string, { old: unknown; new: unknown }>
  description: string | null
  ip_address: string | null
  user_agent: string | null
  url: string | null
  method: string | null
  created_at: string
  human_time: string
}
