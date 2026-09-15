import { useEffect, useMemo, useState } from 'react'
import { Search, X, ShieldCheck, Eye } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AuditActionBadge, entityLabel } from '@/components/admin/AuditBadges'
import { AuditLogDetailModal } from '@/components/admin/AuditLogDetailModal'
import {
  useAuditLogs,
  useAuditActions,
} from '@/hooks/admin/useAuditLogs'
import type { AuditLogEntry } from '@/types/auditLog'

const ENTITY_OPTIONS = [
  { value: '', label: 'Të gjitha' },
  { value: 'Vehicle', label: 'Automjet' },
  { value: 'Customer', label: 'Klient' },
  { value: 'Reservation', label: 'Rezervim' },
  { value: 'Rental', label: 'Rental' },
  { value: 'Payment', label: 'Pagesë' },
  { value: 'Invoice', label: 'Faturë' },
  { value: 'Contract', label: 'Kontratë' },
  { value: 'MaintenanceRecord', label: 'Maintenance' },
  { value: 'Location', label: 'Lokacion' },
]

export default function AuditLogPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [entityFilter, setEntityFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<AuditLogEntry | null>(null)

  const { data: actions } = useAuditActions()

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
      action: actionFilter || undefined,
      entity_type: entityFilter || undefined,
      from: fromDate ? `${fromDate} 00:00:00` : undefined,
      to: toDate ? `${toDate} 23:59:59` : undefined,
      page,
      per_page: 30,
    }),
    [search, actionFilter, entityFilter, fromDate, toDate, page],
  )

  const { data, isLoading, error } = useAuditLogs(filters)

  const hasFilters = !!search || !!actionFilter || !!entityFilter || !!fromDate || !!toDate

  function resetFilters() {
    setSearchInput('')
    setActionFilter('')
    setEntityFilter('')
    setFromDate('')
    setToDate('')
    setPage(1)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-ink">Audit Log</h1>
        <p className="mt-2 text-muted">
          {data ? `${data.meta.total} veprime të regjistruara` : 'Duke ngarkuar…'}
        </p>
      </div>

      <div className="mb-5 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Kërko përdorues, entitet ose përshkrim…"
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
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1) }}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-ink/30 focus:outline-none"
          >
            <option value="">Të gjitha veprimet</option>
            {(actions ?? []).map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <select
            value={entityFilter}
            onChange={(e) => { setEntityFilter(e.target.value); setPage(1) }}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-ink/30 focus:outline-none"
          >
            {ENTITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
            >
              <X className="h-4 w-4" />
              Pastro
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium text-muted">Nga:</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setPage(1) }}
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm focus:border-ink/30 focus:outline-none"
          />
          <span className="text-xs font-medium text-muted">Deri:</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => { setToDate(e.target.value); setPage(1) }}
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm focus:border-ink/30 focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <p className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Gabim: {(error as Error).message}
        </p>
      )}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-line/40" />
          ))}
        </div>
      )}

      {data && data.data.length === 0 && (
        <div className="rounded-2xl border border-line bg-white p-12 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-muted" />
          <p className="mt-4 font-display text-xl font-semibold text-ink">Asnjë veprim</p>
          <p className="mt-1 text-sm text-muted">
            {hasFilters ? 'Provo të ndryshosh filtrat.' : 'Audit log-u është bosh.'}
          </p>
        </div>
      )}

      {data && data.data.length > 0 && (
        <>
          <div className="space-y-2">
            {data.data.map((log) => (
              <div
                key={log.id}
                className="group rounded-2xl border border-line bg-white p-4 transition-colors hover:border-ink/20"
              >
                <div className="flex items-start gap-4">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center pt-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-gold" />
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <AuditActionBadge action={log.action} />
                      <span className="text-sm font-medium text-ink">
                        {entityLabel(log.entity.short_name)}
                      </span>
                      {log.entity.label && (
                        <span className="text-sm text-muted">· {log.entity.label}</span>
                      )}
                    </div>

                    {log.description && (
                      <p className="mt-1.5 text-sm text-muted">{log.description}</p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                      <span>
                        <strong className="font-medium text-ink">
                          {log.user.name ?? 'Sistemi'}
                        </strong>
                        {log.user.email && ` · ${log.user.email}`}
                      </span>
                      <span>·</span>
                      <span>{log.human_time}</span>
                      {Object.keys(log.changed_fields).length > 0 && (
                        <>
                          <span>·</span>
                          <span>
                            {Object.keys(log.changed_fields).length} fusha ndryshuan
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action button */}
                  <button
                    type="button"
                    onClick={() => setSelected(log)}
                    className="shrink-0 rounded-lg p-2 text-muted opacity-0 transition-opacity hover:bg-ink/5 hover:text-ink group-hover:opacity-100"
                    title="Shiko detajet"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
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

      {selected && (
        <AuditLogDetailModal log={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
