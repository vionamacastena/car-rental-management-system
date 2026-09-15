import { useState } from 'react'
import { Plus, Pencil, Trash2, AlertCircle, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LocationFormModal } from '@/components/admin/LocationFormModal'
import {
  useAdminLocations,
  useDeleteLocation,
} from '@/hooks/admin/useAdminLocations'
import { cn } from '@/lib/cn'
import type { Location } from '@/types/vehicle'

export default function LocationsPage() {
  const { data: locations, isLoading, error } = useAdminLocations()
  const deleteMutation = useDeleteLocation()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Location | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Location | null>(null)

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(location: Location) {
    setEditing(location)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
  }

  function handleDelete() {
    if (!confirmDelete) return
    deleteMutation.mutate(confirmDelete.id, {
      onSuccess: () => setConfirmDelete(null),
    })
  }

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Lokacionet</h1>
          <p className="mt-2 text-muted">Menaxho pikat e marrjes dhe kthimit.</p>
        </div>
        <Button variant="primary" size="md" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Shto lokacion
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-line/40" />
          ))}
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Gabim: {(error as Error).message}
        </p>
      )}

      {locations && locations.length === 0 && (
        <div className="rounded-2xl border border-line bg-white p-12 text-center">
          <MapPin className="mx-auto h-10 w-10 text-muted" />
          <p className="mt-4 font-display text-xl font-semibold text-ink">Asnjë lokacion</p>
          <p className="mt-1 text-sm text-muted">Shto lokacionin e parë për të filluar.</p>
        </div>
      )}

      {locations && locations.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <table className="w-full">
            <thead className="border-b border-line bg-cream/50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted">
                <th className="px-6 py-3.5">Emri</th>
                <th className="px-6 py-3.5">Qyteti</th>
                <th className="px-6 py-3.5">Kontakti</th>
                <th className="px-6 py-3.5 text-center">Automjete</th>
                <th className="px-6 py-3.5 text-center">Statusi</th>
                <th className="px-6 py-3.5 text-right">Veprime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {locations.map((loc) => (
                <tr key={loc.id} className="text-sm">
                  <td className="px-6 py-4">
                    <p className="font-medium text-ink">{loc.name}</p>
                    <p className="text-xs text-muted">{loc.address}</p>
                  </td>
                  <td className="px-6 py-4 text-ink">{loc.city}</td>
                  <td className="px-6 py-4 text-xs text-muted">
                    {loc.phone && <p>{loc.phone}</p>}
                    {loc.email && <p>{loc.email}</p>}
                  </td>
                  <td className="px-6 py-4 text-center text-ink">{loc.vehicles_count ?? 0}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={cn(
                        'inline-block rounded-full px-2.5 py-1 text-xs font-medium',
                        loc.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600',
                      )}
                    >
                      {loc.is_active ? 'Aktiv' : 'Joaktiv'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(loc)}
                        className="rounded-lg p-2 text-muted transition-colors hover:bg-ink/5 hover:text-ink"
                        title="Ndrysho"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(loc)}
                        className="rounded-lg p-2 text-muted transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Fshij"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && <LocationFormModal location={editing} onClose={closeModal} />}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setConfirmDelete(null)} />
          <div className="relative w-full max-w-md rounded-2xl bg-cream p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-ink">Fshij lokacionin?</h3>
                <p className="mt-1 text-sm text-muted">
                  A jeni i sigurt që doni të fshini <strong>{confirmDelete.name}</strong>?
                  Ky veprim nuk mund të kthehet.
                </p>
              </div>
            </div>

            {deleteMutation.error && (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {(() => {
                  const err = deleteMutation.error as any
                  return err?.response?.data?.message ?? 'Gabim gjatë fshirjes.'
                })()}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" size="md" onClick={() => setConfirmDelete(null)}>
                Anulo
              </Button>
              <Button
                variant="primary"
                size="md"
                className="!bg-red-600 !text-white hover:!bg-red-700"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Duke fshirë…' : 'Fshij'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
