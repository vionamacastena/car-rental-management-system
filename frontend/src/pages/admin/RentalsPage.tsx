import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, X, FileText, AlertCircle, LogIn, LogOut, Ban } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { RentalStatusBadge, RENTAL_STATUS_OPTIONS } from '@/components/admin/RentalStatusBadge'
import { StartRentalModal } from '@/components/admin/StartRentalModal'
import { useAdminRentals, useCancelRental } from '@/hooks/admin/useAdminRentals'
import type { Rental, RentalStatusValue } from '@/types/rental'

export default function RentalsPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<RentalStatusValue | ''>('')
  const [openOnly, setOpenOnly] = useState(false)
  const [page, setPage] = useState(1)

  const [startModalOpen, setStartModalOpen] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<Rental | null>(null)

  const cancelMutation = useCancelRental()

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
      open_only: openOnly || undefined,
      sort_by: 'created_at' as const,
      sort_dir: 'desc' as const,
      page,
      per_page: 20,
    }),
    [search, statusFilter, openOnly, page],
  )

  const { data, isLoading, error } = useAdminRentals(filters)

  function handleCancel() {
    if (!cancelTarget) return
    cancelMutation.mutate(cancelTarget.id, {
      onSuccess: () => setCancelTarget(null),
    })
  }

  const hasFilters = !!search || !!statusFilter || openOnly

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Rentals</h1>
          <p className="mt-2 text-muted">
            {data ? `${data.meta.total} rentals gjithsej` : 'Duke ngarkuar…'}
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setStartModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Fillo rental
        </Button>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Kërko kod ose klient…"
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
            setStatusFilter(e.target.value as RentalStatusValue | '')
            setPage(1)
          }}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-ink/30 focus:outline-none"
        >
          <option value="">Të gjitha statuset</option>
          {RENTAL_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={openOnly}
            onChange={(e) => { setOpenOnly(e.target.checked); setPage(1) }}
            className="h-4 w-4 rounded border-line accent-ink"
          />
          Vetëm të hapura
        </label>

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setSearchInput('')
              setStatusFilter('')
              setOpenOnly(false)
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
          <FileText className="mx-auto h-10 w-10 text-muted" />
          <p className="mt-4 font-display text-xl font-semibold text-ink">Asnjë rental</p>
          <p className="mt-1 text-sm text-muted">
            {hasFilters ? 'Provo të ndryshosh filtrat.' : 'Kliko "Fillo rental" për të krijuar një.'}
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
                    <th className="px-5 py-3.5">Klienti</th>
                    <th className="px-5 py-3.5">Automjeti</th>
                    <th className="px-5 py-3.5">Periudha</th>
                    <th className="px-5 py-3.5">Totali</th>
                    <th className="px-5 py-3.5">Statusi</th>
                    <th className="px-5 py-3.5 text-right">Veprime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.data.map((r) => (
                    <tr key={r.id} className="text-sm">
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-ink">
                        {r.rental_code}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-ink">{r.customer.full_name}</p>
                        <p className="text-xs text-muted">{r.customer.phone}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-ink">{r.vehicle.full_name}</p>
                        <p className="font-mono text-xs text-muted">{r.vehicle.license_plate}</p>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted">
                        <p>{formatDT(r.planned_pickup_at)}</p>
                        <p>→ {formatDT(r.planned_return_at)}</p>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-ink">
                        {r.pricing.total_amount.toFixed(2)}€
                      </td>
                      <td className="px-5 py-3.5">
                        <RentalStatusBadge status={r.status.value} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          {r.status.value === 'pending_checkout' && (
                            <>
                              <Link
                                to={`/admin/rentals/${r.id}/checkout`}
                                className="inline-flex items-center gap-1 rounded-lg bg-ink px-2.5 py-1.5 text-xs font-medium text-cream transition-colors hover:bg-ink/90"
                              >
                                <LogOut className="h-3 w-3" />
                                Check-out
                              </Link>
                              <button
                                type="button"
                                onClick={() => setCancelTarget(r)}
                                className="rounded-lg p-2 text-muted transition-colors hover:bg-red-50 hover:text-red-600"
                                title="Anulo rental"
                              >
                                <Ban className="h-4 w-4" />
                              </button>
                            </>
                          )}

                          {r.status.value === 'active' && (
                            <Link
                              to={`/admin/rentals/${r.id}/checkin`}
                              className="inline-flex items-center gap-1 rounded-lg bg-gold px-2.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-gold/90"
                            >
                              <LogIn className="h-3 w-3" />
                              Check-in
                            </Link>
                          )}

                          {r.status.value === 'completed' && (
                            <span className="text-xs text-muted">Përfunduar</span>
                          )}
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

      {startModalOpen && (
        <StartRentalModal onClose={() => setStartModalOpen(false)} />
      )}

      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setCancelTarget(null)} />
          <div className="relative w-full max-w-md rounded-2xl bg-cream p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-ink">Anulo rental?</h3>
                <p className="mt-1 text-sm text-muted">
                  <strong>{cancelTarget.rental_code}</strong> — {cancelTarget.customer.full_name}
                </p>
              </div>
            </div>

            {cancelMutation.error && (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {(() => {
                  const err = cancelMutation.error as any
                  return err?.response?.data?.message ?? 'Gabim gjatë anulimit.'
                })()}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" size="md" onClick={() => setCancelTarget(null)}>
                Mbaj
              </Button>
              <Button
                variant="primary"
                size="md"
                className="!bg-red-600 !text-white hover:!bg-red-700"
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? 'Duke anuluar…' : 'Anulo rental'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function formatDT(value: string): string {
  const d = new Date(value)
  return d.toLocaleString('sq-AL', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
