import { api } from '@/services/api'
import type { SettingsByGroup } from '@/types/setting'

export async function fetchSettings(): Promise<SettingsByGroup> {
  const { data } = await api.get<{ data: SettingsByGroup }>('/admin/settings')
  return data.data
}

export async function updateSettings(settings: Record<string, unknown>): Promise<void> {
  await api.post('/admin/settings/bulk-update', { settings })
}
