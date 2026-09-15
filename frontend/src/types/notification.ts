export type NotificationType =
  | 'new_reservation'
  | 'reservation_overdue'
  | 'maintenance_due'
  | 'payment_received'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  url: string | null
  data: Record<string, unknown>
  read_at: string | null
  is_read: boolean
  created_at: string
  human_time: string
}

export interface NotificationMeta {
  total: number
  per_page: number
  current_page: number
  last_page: number
  unread_count: number
}
