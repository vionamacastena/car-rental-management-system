import { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, AlertCircle, Car, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { VehicleStatusBadge, STATUS_OPTIONS } from '@/components/admin/VehicleStatusBadge'
import { VehicleFormModal } from '@/components/admin/VehicleFormModal'
import {
  useAdminVehicles,
  useDeleteVehicle,
  useUpdateVehicleStatus,
} from '@/hooks/admin/useAdminVehicles'
import { useLocations } from '@/hooks/useLocations'
import type { Vehicle, VehicleStatusValue } from '@/types/vehicle'

const DEFAULT_PER_PAGE = 20

export default function VehiclesPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<VehicleStatusValue | ''>('')
  const [locationFilter, setLocationFilter] = useState<number | ''>('')
  const [page, setPage] = useState(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Vehicle | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Vehicle | null>(null)
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null)

  const { data: locations } = useLocations()
  const deleteMutation = useDeleteVehicle()
  const statusMutation = useUpdateVehicleStatus()

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const filters = useMemo(
    () => ({
      search: search || undefined,
      status: statusFilter || undefined,
      location_id: locationFilter || undefined,
      sort_by: 'created_at' as const,
      sort_dir: 'desc' as const,
      page,
      per_page: DEFAULT_PER_PAGE,
    }),
    [search, statusFilter, locationFilter, page],
  )

  const { data, isLoading, error } = useAdminVehicles(filters)

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(v: Vehicle) {
    setEditing(v)
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

  function handleStatusChange(v: Vehicle, next: VehicleStatusValue) {
    if (next === v.status.value) return
    setStatusUpdatingId(v.id)
    statusMutation.mutate(
      { id: v.id, status: next },
      { onSettled: () => setStatusUpdatingId(null) },
    )
  }

  const hasFilters = !!search || !!statusFilter || !!locationFilter

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Automjetet</h1>
          <p className="mt-2 text-muted">
            {data ? `${data.meta.total} automjete gjithsej` : 'Duke ngarkuar…'}
          </p>
        </div>
        <Button variant="primary" size="md" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Shto automjet
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Kërko brand, model, targë…"
            className="w-full rounded-lg border border-line bg-white pl-10 pr-9 py-2 text-sm text-ink placeholder:text-muted focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as VehicleStatusValue | '')
            setPage(1)
          }}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-ink/30 focus:outline-none"
        >
          <option value="">Të gjitha statuset</option>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={locationFilter}
          onChange={(e) => {
            setLocationFilter(e.target.value ? Number(e.target.value) : '')
            setPage(1)
          }}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-ink/30 focus:outline-none"
        >
          <option value="">Të gjitha lokacionet</option>
          {locations?.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setSearchInput('')
              setStatusFilter('')
              setLocationFilter('')
              setPage(1)
            }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
          >
            <X className="h-4 w-4" />
            Pastro
          </button>
        )}
      </div>

      {/* Errors */}
      {error && (
        <p className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Gabim: {(error as Error).message}
        </p>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-line/40" />
          ))}
        </div>
      )}

      {/* Empty */}
      {data && data.data.length === 0 && (
        <div className="rounded-2xl border border-line bg-white p-12 text-center">
          <Car className="mx-auto h-10 w-10 text-muted" />
          <p className="mt-4 font-display text-xl font-semibold text-ink">
            Asnjë automjet nuk u gjet
          </p>
          <p className="mt-1 text-sm text-muted">
            {hasFilters ? 'Provo të ndryshosh filtrat.' : 'Shto automjetin e parë.'}
          </p>
        </div>
      )}

      {/* Table */}
      {data && data.data.length > 0 && (
        <>
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-line bg-cream/50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted">
                    <th className="px-5 py-3.5">Automjeti</th>
                    <th className="px-5 py-3.5">Targa</th>
                    <th className="px-5 py-3.5">Lokacioni</th>
                    <th className="px-5 py-3.5">Çmimi / ditë</th>
                    <th className="px-5 py-3.5">Statusi</th>
                    <th className="px-5 py-3.5 text-right">Veprime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.data.map((v) => (
                    <tr key={v.id} className="text-sm">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-cream">
                            {v.primary_photo?.url ? (
                              <img
                                src={v.primary_photo.url}
                                alt={v.full_name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Car className="h-4 w-4 text-muted" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-ink">{v.full_name}</p>
                            <p className="text-xs text-muted">
                              {v.year} · {v.transmission.label} · {v.fuel_type.label}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-ink">{v.license_plate}</td>
                      <td className="px-5 py-3.5 text-xs text-muted">
                        {v.location?.name ?? '—'}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-ink">€{v.daily_price}</td>
                      <td className="px-5 py-3.5">
                        <select
                          value={v.status.value}
                          onChange={(e) => handleStatusChange(v, e.target.value as VehicleStatusValue)}
                          disabled={statusUpdatingId === v.id}
                          className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-medium text-ink focus:border-ink/30 focus:outline-none disabled:opacity-50"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(v)}
                            className="rounded-lg p-2 text-muted transition-colors hover:bg-ink/5 hover:text-ink"
                            title="Ndrysho"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(v)}
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
          </div>

          {/* Pagination */}
          {data.meta.last_page > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-xs text-muted">
                Faqja {data.meta.current_page} nga {data.meta.last_page}
              </p>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Para
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Pas
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Status badge legend — opcionale, mund të fshihet */}
      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <VehicleStatusBadge key={opt.value} status={opt.value} />
        ))}
      </div>

      {/* Modals */}
      {modalOpen && <VehicleFormModal vehicle={editing} onClose={closeModal} />}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setConfirmDelete(null)} />
          <div className="relative w-full max-w-md rounded-2xl bg-cream p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-ink">Fshij automjetin?</h3>
                <p className="mt-1 text-sm text-muted">
                  A jeni i sigurt që doni të fshini{' '}
                  <strong>{confirmDelete.full_name}</strong> ({confirmDelete.license_plate})?
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
