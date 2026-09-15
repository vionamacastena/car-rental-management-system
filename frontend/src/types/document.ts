export type DocumentTypeValue =
  | 'driver_license' | 'id_card' | 'passport'
  | 'registration' | 'insurance' | 'technical_inspection' | 'ownership' | 'service_record'
  | 'contract' | 'invoice' | 'damage_photo' | 'checkin_photo' | 'checkout_photo'
  | 'other'

export type DocumentableType = 'customer' | 'vehicle' | 'rental' | 'reservation' | 'contract' | 'invoice'

export interface AppDocument {
  id: number
  documentable: {
    type: string
    id: number
  }
  type: {
    value: DocumentTypeValue
    label: string
  }
  title: string
  description: string | null
  file_name: string
  mime_type: string
  file_size: number
  human_size: string
  metadata: Record<string, unknown> | null
  expires_at: string | null
  is_expired: boolean
  expires_in_days: number | null
  is_confidential: boolean
  download_url: string
  uploaded_by?: {
    id: number
    name: string
  }
  created_at: string
}
