import { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Search, X, Wrench, AlertCircle, Ban, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MaintenanceFormModal } from '@/components/admin/MaintenanceFormModal'
import {
  MaintenanceStatusBadge,
  MaintenanceTypeBadge,
  MAINTENANCE_STATUS_OPTIONS,
} from '@/components/admin/MaintenanceBadges'
import {
  useAdminMaintenance,
  useCancelMaintenance,
  useDeleteMaintenance,
} from '@/hooks/admin/useAdminMaintenance'
import { cn } from '@/lib/cn'
import type { MaintenanceRecord, MaintenanceStatusValue } from '@/types/maintenance'

export default function MaintenancePage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatusValue | ''>('')
  const [overdueOnly, setOverdueOnly] = useState(false)
  const [upcomingOnly, setUpcomingOnly] = useState(false)
  const [page, setPage] = useState(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<MaintenanceRecord | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<MaintenanceRecord | null>(null)
  const [confirmCancel, setConfirmCancel] = useState<MaintenanceRecord | null>(null)

  const cancelMutation = useCancelMaintenance()
  const deleteMutation = useDeleteMaintenance()

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
      overdue: overdueOnly || undefined,
      upcoming_service: upcomingOnly || undefined,
      sort_by: 'created_at' as const,
      sort_dir: 'desc' as const,
      page,
      per_page: 20,
    }),
    [search, statusFilter, overdueOnly, upcomingOnly, page],
  )

  const { data, isLoading, error } = useAdminMaintenance(filters)
  const hasFilters = !!search || !!statusFilter || overdueOnly || upcomingOnly

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(r: MaintenanceRecord) {
    setEditing(r)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
  }

  function handleCancel() {
    if (!confirmCancel) return
    cancelMutation.mutate(confirmCancel.id, { onSuccess: () => setConfirmCancel(null) })
  }

  function handleDelete() {
    if (!confirmDelete) return
    deleteMutation.mutate(confirmDelete.id, { onSuccess: () => setConfirmDelete(null) })
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Maintenance</h1>
          <p className="mt-2 text-muted">
            {data ? `${data.meta.total} regjistrime gjithsej` : 'Duke ngarkuar…'}
          </p>
        </div>
        <Button variant="primary" size="md" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Shto maintenance
        </Button>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Kërko kod, titull ose automjet…"
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
          onChange={(e) => { setStatusFilter(e.target.value as MaintenanceStatusValue | ''); setPage(1) }}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-ink/30 focus:outline-none"
        >
          <option value="">Të gjitha statuset</option>
          {MAINTENANCE_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={overdueOnly}
            onChange={(e) => { setOverdueOnly(e.target.checked); setPage(1) }}
            className="h-4 w-4 rounded border-line accent-ink"
          />
          Të vonuara
        </label>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={upcomingOnly}
            onChange={(e) => { setUpcomingOnly(e.target.checked); setPage(1) }}
            className="h-4 w-4 rounded border-line accent-ink"
          />
          Servis 30 ditë
        </label>

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setSearchInput('')
              setStatusFilter('')
              setOverdueOnly(false)
              setUpcomingOnly(false)
              setPage(1)
            }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
          >
            <X className="h-4 w-4" />
            Pastro
          </button>
        )}
      </div>

      {error && (
        <p className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Gabim: {(error as Error).message}
        </p>
      )}

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-line/40" />
          ))}
        </div>
      )}

      {data && data.data.length === 0 && (
        <div className="rounded-2xl border border-line bg-white p-12 text-center">
          <Wrench className="mx-auto h-10 w-10 text-muted" />
          <p className="mt-4 font-display text-xl font-semibold text-ink">Asnjë maintenance</p>
          <p className="mt-1 text-sm text-muted">
            {hasFilters ? 'Provo të ndryshosh filtrat.' : 'Kliko "Shto maintenance" për të filluar.'}
          </p>
        </div>
      )}

      {data && data.data.length > 0 && (
        <>
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-line bg-cream/50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted">
                    <th className="px-5 py-3.5">Kodi</th>
                    <th className="px-5 py-3.5">Automjeti</th>
                    <th className="px-5 py-3.5">Titulli</th>
                    <th className="px-5 py-3.5">Lloji</th>
                    <th className="px-5 py-3.5">Statusi</th>
                    <th className="px-5 py-3.5 text-right">Kosto</th>
                    <th className="px-5 py-3.5">Servisi tjetër</th>
                    <th className="px-5 py-3.5 text-right">Veprime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.data.map((r) => (
                    <tr key={r.id} className="text-sm">
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-ink">
                        {r.maintenance_code}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-ink">{r.vehicle.full_name}</p>
                        <p className="font-mono text-xs text-muted">{r.vehicle.license_plate}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-ink">{r.title}</p>
                        {r.is_overdue && (
                          <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-red-600">
                            <AlertCircle className="h-3 w-3" />
                            Vonuar
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <MaintenanceTypeBadge type={r.type.value} label={r.type.label} />
                      </td>
                      <td className="px-5 py-3.5">
                        <MaintenanceStatusBadge status={r.status.value} />
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium text-ink">
                        {r.cost.toFixed(2)}€
                      </td>
                      <td className="px-5 py-3.5 text-xs">
                        {r.next_service_at ? (
                          <span
                            className={cn(
                              r.days_until_next_service !== null && r.days_until_next_service < 0
                                ? 'font-medium text-red-600'
                                : r.days_until_next_service !== null && r.days_until_next_service <= 7
                                  ? 'font-medium text-amber-600'
                                  : 'text-muted',
                            )}
                          >
                            {r.next_service_at}
                            {r.days_until_next_service !== null && (
                              <span className="ml-1">
                                ({r.days_until_next_service}d)
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          {r.status.value !== 'completed' && r.status.value !== 'cancelled' && (
                            <button
                              type="button"
                              onClick={() => setConfirmCancel(r)}
                              title="Anulo"
                              className="rounded-lg p-2 text-muted transition-colors hover:bg-amber-50 hover:text-amber-600"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          )}
                          {r.status.value === 'scheduled' || r.status.value === 'cancelled' ? (
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(r)}
                              title="Fshij"
                              className="rounded-lg p-2 text-muted transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => openEdit(r)}
                            title="Ndrysho"
                            className="rounded-lg p-2 text-muted transition-colors hover:bg-ink/5 hover:text-ink"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {data.meta.last_page > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-xs text-muted">
                Faqja {data.meta.current_page} nga {data.meta.last_page}
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Para
                </Button>
                <Button variant="outline" size="sm" disabled={page >= data.meta.last_page} onClick={() => setPage((p) => p + 1)}>
                  Pas
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {modalOpen && <MaintenanceFormModal record={editing} onClose={closeModal} />}

      {confirmDelete && (
        <ConfirmDialog
          title="Fshij regjistrimin?"
          description={`${confirmDelete.maintenance_code} — ${confirmDelete.title}`}
          confirmLabel="Fshij"
          color="red"
          onCancel={() => setConfirmDelete(null)}
          onConfirm={handleDelete}
          loading={deleteMutation.isPending}
          error={(deleteMutation.error as any)?.response?.data?.message}
        />
      )}

      {confirmCancel && (
        <ConfirmDialog
          title="Anulo maintenance?"
          description={`${confirmCancel.maintenance_code} — ${confirmCancel.title}`}
          confirmLabel="Anulo maintenance"
          color="amber"
          onCancel={() => setConfirmCancel(null)}
          onConfirm={handleCancel}
          loading={cancelMutation.isPending}
          error={(cancelMutation.error as any)?.response?.data?.message}
        />
      )}
    </div>
  )
}

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  color,
  onCancel,
  onConfirm,
  loading,
  error,
}: {
  title: string
  description: string
  confirmLabel: string
  color: 'red' | 'amber'
  onCancel: () => void
  onConfirm: () => void
  loading: boolean
  error?: string
}) {
  const colors = {
    red: '!bg-red-600 !text-white hover:!bg-red-700',
    amber: '!bg-amber-500 !text-ink hover:!bg-amber-600',
  }
  const icon = {
    red: <AlertCircle className="h-5 w-5 text-red-600" />,
    amber: <AlertCircle className="h-5 w-5 text-amber-600" />,
  }
  const bg = {
    red: 'bg-red-100',
    amber: 'bg-amber-100',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-2xl bg-cream p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', bg[color])}>
            {icon[color]}
          </span>
          <div>
            <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
            <p className="mt-1 text-sm text-muted">{description}</p>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="md" onClick={onCancel}>
            Mbaj
          </Button>
          <Button
            variant="primary"
            size="md"
            className={colors[color]}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Duke procesuar…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
