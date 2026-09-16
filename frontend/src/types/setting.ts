export type SettingType = 'string' | 'int' | 'float' | 'bool' | 'json'

export interface AppSetting {
  id: number
  key: string
  value: string | number | boolean | null
  type: SettingType
  group: string
  label: string
  description: string | null
  is_public: boolean
  updated_at: string
}

export type SettingsByGroup = Record<string, AppSetting[]>
