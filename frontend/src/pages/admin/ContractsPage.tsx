import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, X, FileSignature, Download, Eye } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ContractStatusBadge, CONTRACT_STATUS_OPTIONS } from '@/components/admin/ContractStatusBadge'
import { GenerateContractModal } from '@/components/admin/GenerateContractModal'
import { useAdminContracts, useDownloadContractPdf } from '@/hooks/admin/useAdminContracts'
import type { ContractStatusValue } from '@/types/contract'

export default function ContractsPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ContractStatusValue | ''>('')
  const [page, setPage] = useState(1)
  const [generateModalOpen, setGenerateModalOpen] = useState(false)

  const download = useDownloadContractPdf()

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

  const { data, isLoading, error } = useAdminContracts(filters)
  const hasFilters = !!search || !!statusFilter

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Kontratat</h1>
          <p className="mt-2 text-muted">
            {data ? `${data.meta.total} kontrata gjithsej` : 'Duke ngarkuar…'}
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setGenerateModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Gjenero kontratë
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
          onChange={(e) => { setStatusFilter(e.target.value as ContractStatusValue | ''); setPage(1) }}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-ink/30 focus:outline-none"
        >
          <option value="">Të gjitha statuset</option>
          {CONTRACT_STATUS_OPTIONS.map((o) => (
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
          <FileSignature className="mx-auto h-10 w-10 text-muted" />
          <p className="mt-4 font-display text-xl font-semibold text-ink">Asnjë kontratë</p>
          <p className="mt-1 text-sm text-muted">Kliko "Gjenero kontratë" për të filluar.</p>
          <Button
            variant="primary"
            size="md"
            className="mt-6"
            onClick={() => setGenerateModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Gjenero kontratë
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
                    <th className="px-5 py-3.5">Automjeti</th>
                    <th className="px-5 py-3.5">Firmat</th>
                    <th className="px-5 py-3.5">Statusi</th>
                    <th className="px-5 py-3.5 text-right">Veprime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.data.map((c) => (
                    <tr key={c.id} className="text-sm">
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-ink">
                        {c.contract_number}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-ink">{c.customer?.full_name ?? '—'}</p>
                        <p className="text-xs text-muted">{c.customer?.email ?? ''}</p>
                      </td>
                      <td className="px-5 py-3.5 text-ink">{c.vehicle?.full_name ?? '—'}</td>
                      <td className="px-5 py-3.5 text-xs">
                        <div className="flex flex-col gap-0.5">
                          <span className={c.signatures.customer_signed ? 'text-green-700' : 'text-muted'}>
                            {c.signatures.customer_signed ? '✓ Klienti' : '· Klienti'}
                          </span>
                          <span className={c.signatures.admin_signed ? 'text-green-700' : 'text-muted'}>
                            {c.signatures.admin_signed ? '✓ Admini' : '· Admini'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <ContractStatusBadge status={c.status.value} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          <Link
                            to={`/admin/contracts/${c.id}`}
                            title="Shiko & Firma"
                            className="rounded-lg p-2 text-muted transition-colors hover:bg-ink/5 hover:text-ink"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => download.mutate({ id: c.id, number: c.contract_number })}
                            disabled={download.isPending}
                            title="Shkarko PDF"
                            className="rounded-lg p-2 text-muted transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-50"
                          >
                            <Download className="h-4 w-4" />
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

      {generateModalOpen && <GenerateContractModal onClose={() => setGenerateModalOpen(false)} />}
    </div>
  )
}
