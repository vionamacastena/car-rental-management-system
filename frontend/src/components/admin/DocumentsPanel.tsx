import { useRef, useState } from 'react'
import { Upload, FileText, Download, Trash2, AlertCircle, Loader2, FileWarning, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  useAdminDocuments,
  useUploadDocument,
  useDeleteDocument,
  useDownloadDocument,
} from '@/hooks/admin/useAdminDocuments'
import type { DocumentableType, DocumentTypeValue } from '@/types/document'

interface Props {
  documentableType: DocumentableType
  documentableId: number
  allowedTypes?: { value: DocumentTypeValue; label: string }[]
  title?: string
}

const DEFAULT_TYPES: { value: DocumentTypeValue; label: string }[] = [
  { value: 'other', label: 'Tjetër' },
  { value: 'driver_license', label: 'Patentë' },
  { value: 'id_card', label: 'Letërnjoftim' },
  { value: 'passport', label: 'Pasaportë' },
  { value: 'registration', label: 'Regjistrim' },
  { value: 'insurance', label: 'Sigurim' },
  { value: 'technical_inspection', label: 'Inspektim teknik' },
  { value: 'contract', label: 'Kontratë' },
  { value: 'invoice', label: 'Faturë' },
  { value: 'damage_photo', label: 'Foto dëmi' },
]

const MAX_MB = 20
const ACCEPT = '.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx'

export function DocumentsPanel({
  documentableType,
  documentableId,
  allowedTypes = DEFAULT_TYPES,
  title = 'Dokumente',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [type, setType] = useState<DocumentTypeValue>(allowedTypes[0]?.value ?? 'other')
  const [expiresAt, setExpiresAt] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)

  const { data, isLoading } = useAdminDocuments({
    documentable_type: documentableType,
    documentable_id: documentableId,
  })
  const upload = useUploadDocument()
  const remove = useDeleteDocument()
  const download = useDownloadDocument()

  const documents = data?.data ?? []

  function validateFile(file: File): string | null {
    const sizeMb = file.size / (1024 * 1024)
    if (sizeMb > MAX_MB) return `File është më i madh se ${MAX_MB}MB.`
    const ext = file.name.split('.').pop()?.toLowerCase()
    const allowed = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'doc', 'docx', 'xls', 'xlsx']
    if (!ext || !allowed.includes(ext)) return `Formati .${ext} nuk lejohet.`
    return null
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const file = files[0]
    const err = validateFile(file)
    if (err) {
      setError(err)
      return
    }
    setError(null)
    setPendingFile(file)
  }

  function confirmUpload() {
    if (!pendingFile) return
    upload.mutate(
      {
        documentable_type: documentableType,
        documentable_id: documentableId,
        type,
        expires_at: expiresAt || undefined,
        file: pendingFile,
      },
      {
        onSuccess: () => {
          setPendingFile(null)
          setExpiresAt('')
          if (inputRef.current) inputRef.current.value = ''
        },
        onError: () => setError('Gabim gjatë upload-it.'),
      },
    )
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  function handleDelete(id: number, name: string) {
    if (confirm(`Fshij dokumentin "${name}"?`)) {
      remove.mutate(id)
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      {!pendingFile && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors',
            dragOver ? 'border-gold bg-gold/5' : 'border-line bg-white hover:border-ink/30',
            upload.isPending && 'pointer-events-none opacity-60',
          )}
        >
          {upload.isPending ? (
            <Loader2 className="h-7 w-7 animate-spin text-muted" />
          ) : (
            <Upload className="h-7 w-7 text-muted" />
          )}
          <p className="mt-2 text-sm font-medium text-ink">
            {upload.isPending ? 'Duke ngarkuar…' : 'Kliko ose tërhiq dokument'}
          </p>
          <p className="mt-1 text-xs text-muted">
            PDF, Word, Excel, imazhe · max {MAX_MB}MB
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </div>
      )}

      {/* Upload confirm form */}
      {pendingFile && (
        <div className="rounded-xl border border-gold/40 bg-gold/5 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 mt-0.5 shrink-0 text-ink" />
            <div className="flex-1">
              <p className="font-medium text-ink">{pendingFile.name}</p>
              <p className="text-xs text-muted">
                {(pendingFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setPendingFile(null); setError(null) }}
              className="text-xs text-muted hover:text-ink"
            >
              Anulo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink">Lloji</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DocumentTypeValue)}
                className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm"
              >
                {allowedTypes.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink">Skadon (opsionale)</label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={confirmUpload}
            disabled={upload.isPending}
            className="w-full rounded-lg bg-ink py-2 text-sm font-medium text-cream transition-colors hover:bg-ink/90 disabled:opacity-50"
          >
            {upload.isPending ? 'Duke ngarkuar…' : 'Ngarko dokumentin'}
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Documents list */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-line/40" />
          ))}
        </div>
      )}

      {documents.length > 0 && (
        <ul className="space-y-2">
          {documents.map((doc) => {
            const isImage = doc.mime_type.startsWith('image/')
            return (
              <li
                key={doc.id}
                className="flex items-center gap-3 rounded-xl border border-line bg-white p-3"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream">
                  {isImage ? (
                    <ImageIcon className="h-4 w-4 text-muted" />
                  ) : (
                    <FileText className="h-4 w-4 text-muted" />
                  )}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{doc.title}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted">
                    <span>{doc.type.label}</span>
                    <span>·</span>
                    <span>{doc.human_size}</span>
                    {doc.expires_at && (
                      <>
                        <span>·</span>
                        <span className={doc.is_expired ? 'text-red-600 font-medium' : ''}>
                          {doc.is_expired
                            ? `Skaduar (${doc.expires_at})`
                            : `Skadon ${doc.expires_at}`}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => download.mutate({ id: doc.id, fileName: doc.file_name })}
                    disabled={download.isPending}
                    className="rounded-lg p-2 text-muted hover:bg-ink/5 hover:text-ink disabled:opacity-50"
                    title="Shkarko"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id, doc.title)}
                    disabled={remove.isPending}
                    className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    title="Fshij"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {documents.length === 0 && !isLoading && !pendingFile && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-line bg-white p-6 text-center">
          <FileWarning className="h-7 w-7 text-muted" />
          <p className="mt-2 text-sm text-muted">Asnjë dokument i ngarkuar.</p>
        </div>
      )}
    </div>
  )
}
