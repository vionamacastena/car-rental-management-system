import { useEffect, useMemo, useState } from 'react'
import { Search, X, FileText, Download, RefreshCw, Check, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { InvoiceStatusBadge, INVOICE_STATUS_OPTIONS } from '@/components/admin/PaymentBadges'
import { GenerateInvoiceModal } from '@/components/admin/GenerateInvoiceModal'
import {
  useAdminInvoices,
  useDownloadInvoicePdf,
  useMarkInvoicePaid,
  useRegenerateInvoicePdf,
} from '@/hooks/admin/useAdminInvoices'
import type { InvoiceStatusValue } from '@/types/invoice'

export default function InvoicesPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<InvoiceStatusValue | ''>('')
  const [page, setPage] = useState(1)
  const [generateModalOpen, setGenerateModalOpen] = useState(false)

  const download = useDownloadInvoicePdf()
  const markPaid = useMarkInvoicePaid()
  const regenerate = useRegenerateInvoicePdf()

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
      page,
      per_page: 20,
    }),
    [search, statusFilter, page],
  )

  const { data, isLoading, error } = useAdminInvoices(filters)
  const hasFilters = !!search || !!statusFilter

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Faturat</h1>
          <p className="mt-2 text-muted">
            {data ? `${data.meta.total} fatura gjithsej` : 'Duke ngarkuar…'}
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setGenerateModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Gjenero faturë
        </Button>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Kërko numër ose klient…"
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
          onChange={(e) => { setStatusFilter(e.target.value as InvoiceStatusValue | ''); setPage(1) }}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-ink/30 focus:outline-none"
        >
          <option value="">Të gjitha statuset</option>
          {INVOICE_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={() => { setSearchInput(''); setStatusFilter(''); setPage(1) }}
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
          <p className="mt-4 font-display text-xl font-semibold text-ink">Asnjë faturë</p>
          <p className="mt-1 text-sm text-muted">
            Kliko "Gjenero faturë" për të krijuar nga një rental.
          </p>
          <Button
            variant="primary"
            size="md"
            className="mt-6"
            onClick={() => setGenerateModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Gjenero faturë
          </Button>
        </div>
      )}

      {data && data.data.length > 0 && (
        <>
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-line bg-cream/50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted">
                    <th className="px-5 py-3.5">Numri</th>
                    <th className="px-5 py-3.5">Klienti</th>
                    <th className="px-5 py-3.5">Lëshuar</th>
                    <th className="px-5 py-3.5 text-right">Totali</th>
                    <th className="px-5 py-3.5 text-right">Mbetur</th>
                    <th className="px-5 py-3.5">Statusi</th>
                    <th className="px-5 py-3.5 text-right">Veprime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.data.map((inv) => (
                    <tr key={inv.id} className="text-sm">
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-ink">
                        {inv.invoice_number}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-ink">{inv.customer?.full_name ?? '—'}</p>
                        <p className="text-xs text-muted">{inv.customer?.email ?? ''}</p>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted">
                        {inv.issued_at ? formatDate(inv.issued_at) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium text-ink">
                        {inv.total.toFixed(2)}€
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={inv.amount_due > 0 ? 'text-orange-600 font-medium' : 'text-muted'}>
                          {inv.amount_due.toFixed(2)}€
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <InvoiceStatusBadge status={inv.status.value} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => download.mutate({ id: inv.id, number: inv.invoice_number })}
                            disabled={download.isPending}
                            title="Shkarko PDF"
                            className="rounded-lg p-2 text-muted transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-50"
                          >
                            <Download className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => regenerate.mutate(inv.id)}
                            disabled={regenerate.isPending}
                            title="Rigjenero PDF"
                            className="rounded-lg p-2 text-muted transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-50"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>

                          {inv.status.value !== 'paid' && inv.status.value !== 'cancelled' && (
                            <button
                              type="button"
                              onClick={() => markPaid.mutate(inv.id)}
                              disabled={markPaid.isPending}
                              title="Shëno si të paguar"
                              className="rounded-lg p-2 text-muted transition-colors hover:bg-green-50 hover:text-green-700 disabled:opacity-50"
                            >
                              <Check className="h-4 w-4" />
                            </button>
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

      {generateModalOpen && (
        <GenerateInvoiceModal onClose={() => setGenerateModalOpen(false)} />
      )}
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
