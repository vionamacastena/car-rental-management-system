import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, X, Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { RegisterPaymentModal } from '@/components/admin/RegisterPaymentModal'
import {
  PaymentTypeBadge,
  PaymentStatusBadge,
  methodLabel,
  PAYMENT_TYPE_OPTIONS,
} from '@/components/admin/PaymentBadges'
import { useAdminPayments } from '@/hooks/admin/useAdminPayments'
import type { PaymentTypeValue } from '@/types/payment'

export default function PaymentsPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<PaymentTypeValue | ''>('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)

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
      type: typeFilter || undefined,
      page,
      per_page: 20,
    }),
    [search, typeFilter, page],
  )

  const { data, isLoading, error } = useAdminPayments(filters)

  // Kalkulim totalesh nga faqja aktuale
  const totals = useMemo(() => {
    if (!data) return { incoming: 0, outgoing: 0, net: 0 }
    let incoming = 0
    let outgoing = 0
    for (const p of data.data) {
      if (p.type.is_incoming) incoming += p.net_amount
      else outgoing += p.amount
    }
    return { incoming, outgoing, net: incoming - outgoing }
  }, [data])

  const hasFilters = !!search || !!typeFilter

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Pagesat</h1>
          <p className="mt-2 text-muted">
            {data ? `${data.meta.total} pagesa gjithsej` : 'Duke ngarkuar…'}
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Regjistro pagesë
        </Button>
      </div>

      {/* KPI cards */}
      {data && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPI
            icon={<TrendingUp className="h-4 w-4" />}
            label="Të hyra (faqja)"
            value={`${totals.incoming.toFixed(2)}€`}
            variant="green"
          />
          <KPI
            icon={<TrendingDown className="h-4 w-4" />}
            label="Dalje (faqja)"
            value={`${totals.outgoing.toFixed(2)}€`}
            variant="orange"
          />
          <KPI
            icon={<DollarSign className="h-4 w-4" />}
            label="Neto (faqja)"
            value={`${totals.net.toFixed(2)}€`}
            variant="ink"
          />
        </div>
      )}

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
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value as PaymentTypeValue | '')
            setPage(1)
          }}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-ink/30 focus:outline-none"
        >
          <option value="">Të gjitha llojet</option>
          {PAYMENT_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={() => { setSearchInput(''); setTypeFilter(''); setPage(1) }}
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
          <Wallet className="mx-auto h-10 w-10 text-muted" />
          <p className="mt-4 font-display text-xl font-semibold text-ink">Asnjë pagesë</p>
          <p className="mt-1 text-sm text-muted">
            {hasFilters ? 'Provo të ndryshosh filtrat.' : 'Kliko "Regjistro pagesë" për të filluar.'}
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
                    <th className="px-5 py-3.5">Lloji</th>
                    <th className="px-5 py-3.5">Metoda</th>
                    <th className="px-5 py-3.5 text-right">Shuma</th>
                    <th className="px-5 py-3.5">Statusi</th>
                    <th className="px-5 py-3.5">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.data.map((p) => {
                    const isOutgoing = !p.type.is_incoming
                    return (
                      <tr key={p.id} className="text-sm">
                        <td className="px-5 py-3.5 font-mono text-xs font-semibold text-ink">
                          {p.payment_code}
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-ink">{p.customer?.full_name ?? '—'}</p>
                          <p className="text-xs text-muted">{p.customer?.email ?? ''}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <PaymentTypeBadge type={p.type.value} />
                        </td>
                        <td className="px-5 py-3.5 text-ink">{methodLabel(p.method.value)}</td>
                        <td className={`px-5 py-3.5 text-right font-medium ${isOutgoing ? 'text-orange-600' : 'text-emerald-700'}`}>
                          {isOutgoing ? '−' : '+'}{p.amount.toFixed(2)}€
                          {p.refunded_amount > 0 && (
                            <p className="text-xs text-muted">
                              neto: {p.net_amount.toFixed(2)}€
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <PaymentStatusBadge status={p.status.value} />
                        </td>
                        <td className="px-5 py-3.5 text-xs text-muted">
                          {p.paid_at ? formatDate(p.paid_at) : '—'}
                        </td>
                      </tr>
                    )
                  })}
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

      {modalOpen && <RegisterPaymentModal onClose={() => setModalOpen(false)} />}
    </div>
  )
}

function KPI({
  icon,
  label,
  value,
  variant,
}: {
  icon: React.ReactNode
  label: string
  value: string
  variant: 'green' | 'orange' | 'ink'
}) {
  const colors = {
    green: 'text-emerald-700 bg-emerald-50',
    orange: 'text-orange-700 bg-orange-50',
    ink: 'text-ink bg-cream',
  }
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="flex items-center gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors[variant]}`}>
          {icon}
        </span>
        <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-ink">{value}</p>
    </div>
  )
}

function formatDate(value: string): string {
  const d = new Date(value)
  return d.toLocaleString('sq-AL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
