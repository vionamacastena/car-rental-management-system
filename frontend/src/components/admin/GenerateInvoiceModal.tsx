import { useEffect, useState } from 'react'
import { X, AlertCircle, FileText, Check } from 'lucide-react'
import { AxiosError } from 'axios'
import { Button } from '@/components/ui/Button'
import { useGenerateInvoice } from '@/hooks/admin/useAdminInvoices'
import { useAdminRentals } from '@/hooks/admin/useAdminRentals'
import { RentalStatusBadge } from '@/components/admin/RentalStatusBadge'
import { cn } from '@/lib/cn'
import type { ApiError } from '@/types/api'

interface Props {
  onClose: () => void
}

export function GenerateInvoiceModal({ onClose }: Props) {
  const { data, isLoading } = useAdminRentals({
    per_page: 50,
    sort_by: 'created_at',
    sort_dir: 'desc',
  })

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const generate = useGenerateInvoice()

  // Auto-select i pari
  useEffect(() => {
    if (data && data.data.length > 0 && selectedId === null) {
      setSelectedId(data.data[0].id)
    }
  }, [data, selectedId])

  function handleGenerate() {
    if (!selectedId) return
    generate.mutate(selectedId, {
      onSuccess: () => onClose(),
    })
  }

  const errorMessage = (() => {
    const err = generate.error as AxiosError<ApiError> | null
    if (!err?.response) return null
    return err.response.data?.message ?? 'Gabim gjatë gjenerimit.'
  })()

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-8">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-cream shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">Gjenero faturë</h2>
            <p className="mt-0.5 text-xs text-muted">
              Zgjidh një rental për të krijuar faturën
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-ink/5">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="max-h-96 overflow-y-auto rounded-xl border border-line bg-white">
            {isLoading && (
              <div className="space-y-2 p-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-lg bg-line/40" />
                ))}
              </div>
            )}

            {data && data.data.length === 0 && (
              <div className="p-8 text-center">
                <FileText className="mx-auto h-8 w-8 text-muted" />
                <p className="mt-3 text-sm text-muted">
                  Asnjë rental. Krijoni rental fillimisht.
                </p>
              </div>
            )}

            {data && data.data.length > 0 && (
              <ul className="divide-y divide-line">
                {data.data.map((r) => {
                  const isSelected = selectedId === r.id
                  const isCompleted = r.status.value === 'completed'
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(r.id)}
                        className={cn(
                          'w-full px-4 py-3 text-left transition-colors cursor-pointer',
                          isSelected ? 'bg-gold/15' : 'hover:bg-cream/50',
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={cn(
                              'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                              isSelected ? 'border-gold bg-gold' : 'border-line bg-white',
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3 text-ink" strokeWidth={3} />}
                          </span>

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold text-ink">
                                {r.rental_code}
                              </span>
                              <RentalStatusBadge status={r.status.value} />
                            </div>
                            <p className="mt-1 font-medium text-ink">{r.customer.full_name}</p>
                            <p className="text-xs text-muted">{r.vehicle.full_name}</p>
                          </div>

                          <div className="text-right">
                            <p className="font-display text-lg font-bold text-ink">
                              {r.pricing.total_amount.toFixed(2)}€
                            </p>
                            {!isCompleted && (
                              <p className="text-[10px] text-amber-600">Nuk është përfunduar</p>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
          <Button variant="outline" size="md" onClick={onClose}>
            Anulo
          </Button>
          <Button
            variant="primary"
            size="md"
            className="font-semibold"
            onClick={handleGenerate}
            disabled={!selectedId || generate.isPending}
          >
            <FileText className="h-4 w-4" />
            {generate.isPending ? 'Duke gjeneruar…' : 'Gjenero faturë'}
          </Button>
        </div>
      </div>
    </div>
  )
}
