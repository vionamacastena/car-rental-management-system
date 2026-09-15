import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchAdminDocuments,
  uploadDocument,
  deleteDocument,
  downloadDocument,
  type AdminDocumentFilters,
  type UploadDocumentPayload,
} from '@/services/admin/documents'

const KEY = ['admin', 'documents']

export function useAdminDocuments(filters: AdminDocumentFilters = {}) {
  return useQuery({
    queryKey: [...KEY, filters],
    queryFn: () => fetchAdminDocuments(filters),
  })
}

export function useUploadDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: UploadDocumentPayload) => uploadDocument(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDeleteDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteDocument(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDownloadDocument() {
  return useMutation({
    mutationFn: ({ id, fileName }: { id: number; fileName: string }) =>
      downloadDocument(id, fileName),
  })
}
