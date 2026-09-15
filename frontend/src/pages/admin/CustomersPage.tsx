import { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, AlertCircle, User, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CustomerFormModal } from '@/components/admin/CustomerFormModal'
import {
  useAdminCustomers,
  useDeleteCustomer,
} from '@/hooks/admin/useAdminCustomers'
import type { Customer } from '@/types/customer'

export default function CustomersPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Customer | null>(null)

  const deleteMutation = useDeleteCustomer()

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
      sort_by: 'created_at' as const,
      sort_dir: 'desc' as const,
      page,
      per_page: 20,
    }),
    [search, page],
  )

  const { data, isLoading, error } = useAdminCustomers(filters)

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(c: Customer) {
    setEditing(c)
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
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Klientët</h1>
          <p className="mt-2 text-muted">
            {data ? `${data.meta.total} klientë gjithsej` : 'Duke ngarkuar…'}
          </p>
        </div>
        <Button variant="primary" size="md" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Shto klient
        </Button>
      </div>

      <div className="mb-5 max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Kërko emër, email, telefon…"
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
          <User className="mx-auto h-10 w-10 text-muted" />
          <p className="mt-4 font-display text-xl font-semibold text-ink">Asnjë klient</p>
          <p className="mt-1 text-sm text-muted">
            {search ? 'Provo një kërkim tjetër.' : 'Shto klientin e parë.'}
          </p>
        </div>
      )}

      {data && data.data.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-line bg-cream/50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  <th className="px-5 py-3.5">Emri</th>
                  <th className="px-5 py-3.5">Kontakti</th>
                  <th className="px-5 py-3.5">Qyteti</th>
                  <th className="px-5 py-3.5">Patenta</th>
                  <th className="px-5 py-3.5 text-right">Veprime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.data.map((c) => (
                  <tr key={c.id} className="text-sm">
                    <td className="px-5 py-3.5 font-medium text-ink">{c.full_name}</td>
                    <td className="px-5 py-3.5 text-xs text-muted">
                      <p>{c.email}</p>
                      <p>{c.phone}</p>
                    </td>
                    <td className="px-5 py-3.5 text-ink">{c.city ?? '—'}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted">
                      {c.driver_license_number ?? '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(c)}
                          className="rounded-lg p-2 text-muted transition-colors hover:bg-ink/5 hover:text-ink"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(c)}
                          className="rounded-lg p-2 text-muted transition-colors hover:bg-red-50 hover:text-red-600"
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
      )}

      {modalOpen && <CustomerFormModal customer={editing} onClose={closeModal} />}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setConfirmDelete(null)} />
          <div className="relative w-full max-w-md rounded-2xl bg-cream p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-ink">Fshij klientin?</h3>
                <p className="mt-1 text-sm text-muted">
                  A jeni i sigurt për <strong>{confirmDelete.full_name}</strong>?
                </p>
              </div>
            </div>
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
