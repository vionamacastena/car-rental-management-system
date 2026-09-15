import { api } from '@/services/api'
import type { PaginatedResponse, SingleResponse } from '@/types/api'
import type { AppDocument, DocumentTypeValue, DocumentableType } from '@/types/document'

export interface AdminDocumentFilters {
  documentable_type?: DocumentableType
  documentable_id?: number
  type?: DocumentTypeValue
  search?: string
  page?: number
  per_page?: number
}

export interface UploadDocumentPayload {
  documentable_type: DocumentableType
  documentable_id: number
  type: DocumentTypeValue
  title?: string
  description?: string
  expires_at?: string
  is_confidential?: boolean
  file: File
}

function buildParams(f: AdminDocumentFilters) {
  const params: Record<string, string | number | undefined> = {}
  if (f.documentable_type) params.documentable_type = f.documentable_type
  if (f.documentable_id) params.documentable_id = f.documentable_id
  if (f.type) params.type = f.type
  if (f.search) params.search = f.search
  if (f.page) params.page = f.page
  if (f.per_page) params.per_page = f.per_page
  return params
}

export async function fetchAdminDocuments(f: AdminDocumentFilters = {}): Promise<PaginatedResponse<AppDocument>> {
  const { data } = await api.get<PaginatedResponse<AppDocument>>('/admin/documents', {
    params: buildParams(f),
  })
  return data
}

export async function uploadDocument(payload: UploadDocumentPayload): Promise<AppDocument> {
  const formData = new FormData()
  formData.append('documentable_type', payload.documentable_type)
  formData.append('documentable_id', String(payload.documentable_id))
  formData.append('type', payload.type)
  if (payload.title) formData.append('title', payload.title)
  if (payload.description) formData.append('description', payload.description)
  if (payload.expires_at) formData.append('expires_at', payload.expires_at)
  if (payload.is_confidential) formData.append('is_confidential', '1')
  formData.append('file', payload.file)

  const { data } = await api.post<SingleResponse<AppDocument>>('/admin/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

export async function deleteDocument(id: number): Promise<void> {
  await api.delete(`/admin/documents/${id}`)
}

export async function downloadDocument(id: number, fileName: string): Promise<void> {
  const { data } = await api.get(`/admin/documents/${id}/download`, {
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(data as Blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}
