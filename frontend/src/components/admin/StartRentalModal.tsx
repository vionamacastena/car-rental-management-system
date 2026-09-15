import { useEffect, useState } from 'react'
import { X, AlertCircle, PlayCircle, Search, Check } from 'lucide-react'
import { AxiosError } from 'axios'
import { Button } from '@/components/ui/Button'
import { useStartRental } from '@/hooks/admin/useAdminRentals'
import { useAdminReservations } from '@/hooks/admin/useAdminReservations'
import { ReservationStatusBadge } from '@/components/admin/ReservationStatusBadge'
import { cn } from '@/lib/cn'
import type { ApiError } from '@/types/api'
import type { Reservation } from '@/types/reservation'

interface Props {
  onClose: () => void
  onCreated?: (rentalId: number) => void
}

export function StartRentalModal({ onClose, onCreated }: Props) {
  const [searchInput, setSearchInput] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { data, isLoading } = useAdminReservations({
    status: 'reserved',
    search: searchInput || undefined,
    sort_by: 'pickup_at',
    sort_dir: 'asc',
    per_page: 30,
  })

  // AUTO-SELECT: kur lista mbulohet për herë të parë, zgjedh rezervimin e parë
  useEffect(() => {
    if (data && data.data.length > 0 && selectedId === null) {
      setSelectedId(data.data[0].id)
    }
  }, [data, selectedId])

  const startRental = useStartRental()

  function handleStart() {
    if (!selectedId) return
    startRental.mutate(selectedId, {
      onSuccess: (rental) => {
        onCreated?.(rental.id)
        onClose()
      },
    })
  }

  const errorMessage = (() => {
    const err = startRental.error as AxiosError<ApiError> | null
    if (!err?.response) return null
    return err.response.data?.message ?? 'Gabim gjatë fillimit të rentalit.'
  })()

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-8">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-cream shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">Fillo rental të re</h2>
            <p className="mt-0.5 text-xs text-muted">
              Zgjidh një rezervim të konfirmuar për të kaluar në check-out
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

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Kërko kod ose klient…"
              className="w-full rounded-lg border border-line bg-white pl-10 pr-3 py-2 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
          </div>

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
                <p className="text-sm text-muted">
                  Asnjë rezervim i konfirmuar për momentin.
                </p>
              </div>
            )}

            {data && data.data.length > 0 && (
              <ul className="divide-y divide-line">
                {data.data.map((r) => {
                  const isSelected = selectedId === r.id
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
                          {/* Radio vizual */}
                          <span
                            className={cn(
                              'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                              isSelected
                                ? 'border-gold bg-gold'
                                : 'border-line bg-white',
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3 text-ink" strokeWidth={3} />}
                          </span>

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold text-ink">
                                {r.reservation_code}
                              </span>
                              <ReservationStatusBadge status={r.status.value} />
                            </div>
                            <p className="mt-1 font-medium text-ink">{r.customer.full_name}</p>
                            <p className="text-xs text-muted">
                              {r.vehicle.full_name} · {r.vehicle.license_plate}
                            </p>
                            <p className="text-xs text-muted">
                              {formatDT(r.pickup_at)} → {formatDT(r.return_at)}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-display text-lg font-bold text-ink">
                              {r.pricing.total.toFixed(2)}€
                            </p>
                          </div>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Selected info */}
          {selectedId && data && (
            <p className="text-xs text-muted">
              Zgjedhur:{' '}
              <strong className="text-ink">
                {data.data.find((r) => r.id === selectedId)?.reservation_code}
              </strong>{' '}
              —{' '}
              {data.data.find((r) => r.id === selectedId)?.customer.full_name}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
          <Button variant="outline" size="md" onClick={onClose}>
            Anulo
          </Button>
          <Button
            variant="primary"
            size="md"
            className="font-semibold"
            onClick={handleStart}
            disabled={!selectedId || startRental.isPending}
          >
            <PlayCircle className="h-4 w-4" />
            {startRental.isPending ? 'Duke filluar…' : 'Fillo rental'}
          </Button>
        </div>
      </div>
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
