import { useRef, useState } from 'react'
import { Upload, Star, Trash2, Loader2, ImageOff } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  useUploadPhotos,
  useSetPrimaryPhoto,
  useDeletePhoto,
} from '@/hooks/admin/useVehiclePhotos'
import type { VehiclePhoto } from '@/types/vehicle'

interface Props {
  vehicleId: number
  photos: VehiclePhoto[]
}

const MAX_SIZE_MB = 5
const MAX_FILES = 10

export function PhotosManager({ vehicleId, photos }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = useUploadPhotos(vehicleId)
  const setPrimary = useSetPrimaryPhoto(vehicleId)
  const deletePhoto = useDeletePhoto(vehicleId)

  const isBusy = upload.isPending || setPrimary.isPending || deletePhoto.isPending

  function validateFiles(files: File[]): string | null {
    if (files.length > MAX_FILES) return `Maksimumi ${MAX_FILES} foto njëherësh.`
    for (const f of files) {
      if (!f.type.startsWith('image/')) return `${f.name} nuk është imazh.`
      if (f.size > MAX_SIZE_MB * 1024 * 1024) return `${f.name} është më i madh se ${MAX_SIZE_MB}MB.`
    }
    return null
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)
    const arr = Array.from(files)
    const err = validateFiles(arr)
    if (err) {
      setError(err)
      return
    }
    upload.mutate(arr, {
      onSuccess: () => {
        if (inputRef.current) inputRef.current.value = ''
      },
      onError: () => setError('Gabim gjatë upload-it. Provo përsëri.'),
    })
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const sorted = [...photos].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1
    return a.sort_order - b.sort_order
  })

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors',
          dragOver ? 'border-gold bg-gold/5' : 'border-line bg-white hover:border-ink/30',
          isBusy && 'pointer-events-none opacity-60',
        )}
      >
        {upload.isPending ? (
          <Loader2 className="h-8 w-8 animate-spin text-muted" />
        ) : (
          <Upload className="h-8 w-8 text-muted" />
        )}
        <p className="mt-3 text-sm font-medium text-ink">
          {upload.isPending ? 'Duke ngarkuar…' : 'Kliko ose tërhiq fotot këtu'}
        </p>
        <p className="mt-1 text-xs text-muted">
          JPG, PNG, WEBP · max {MAX_SIZE_MB}MB · deri në {MAX_FILES} foto
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Gallery */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {sorted.map((photo) => (
            <div
              key={photo.id}
              className={cn(
                'group relative aspect-[4/3] overflow-hidden rounded-xl border-2 bg-cream transition-colors',
                photo.is_primary ? 'border-gold' : 'border-transparent',
              )}
            >
              <img
                src={photo.url}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />

              {photo.is_primary && (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[10px] font-semibold text-ink">
                  <Star className="h-3 w-3 fill-current" />
                  Primary
                </span>
              )}

              {/* Hover actions */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink/60 opacity-0 transition-opacity group-hover:opacity-100">
                {!photo.is_primary && (
                  <button
                    type="button"
                    onClick={() => setPrimary.mutate(photo.id)}
                    disabled={isBusy}
                    title="Bëj foto kryesore"
                    className="rounded-lg bg-white p-2 text-ink transition-colors hover:bg-gold disabled:opacity-50"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Fshij këtë foto?')) deletePhoto.mutate(photo.id)
                  }}
                  disabled={isBusy}
                  title="Fshij"
                  className="rounded-lg bg-white p-2 text-red-600 transition-colors hover:bg-red-600 hover:text-white disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-line bg-white p-8 text-center">
          <ImageOff className="h-8 w-8 text-muted" />
          <p className="mt-3 text-sm text-muted">Asnjë foto. Ngarko të parën më sipër.</p>
        </div>
      )}
    </div>
  )
}
