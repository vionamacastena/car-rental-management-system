import { api } from '@/services/api'
import type { AppNotification, NotificationMeta } from '@/types/notification'

export interface AdminNotificationFilters {
  unread_only?: boolean
  type?: string
  page?: number
  per_page?: number
}

interface NotificationsResponse {
  data: AppNotification[]
  meta: NotificationMeta
}

function buildParams(f: AdminNotificationFilters) {
  const params: Record<string, string | number | undefined> = {}
  if (f.unread_only) params.unread_only = 1
  if (f.type) params.type = f.type
  if (f.page) params.page = f.page
  if (f.per_page) params.per_page = f.per_page
  return params
}

export async function fetchNotifications(f: AdminNotificationFilters = {}): Promise<NotificationsResponse> {
  const { data } = await api.get<NotificationsResponse>('/admin/notifications', {
    params: buildParams(f),
  })
  return data
}

export async function fetchUnreadCount(): Promise<number> {
  const { data } = await api.get<{ data: { unread_count: number } }>(
    '/admin/notifications/unread-count',
  )
  return data.data.unread_count
}

export async function markNotificationRead(id: string): Promise<AppNotification> {
  const { data } = await api.post<{ data: AppNotification }>(
    `/admin/notifications/${id}/read`,
  )
  return data.data
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.post('/admin/notifications/mark-all-read')
}

export async function deleteNotification(id: string): Promise<void> {
  await api.delete(`/admin/notifications/${id}`)
}
