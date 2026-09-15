import { useState, type FormEvent } from 'react'
import { AxiosError } from 'axios'
import { Search, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { lookupReservation } from '@/services/reservations'
import type { ApiError } from '@/types/api'
import type { Reservation } from '@/types/reservation'

export default function ReservationLookupPage() {
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setReservation(null)
    setLoading(true)
    try {
      const r = await lookupReservation(code.trim(), email.trim())
      setReservation(r)
    } catch (err) {
      const axErr = err as AxiosError<ApiError>
      setError(
        axErr.response?.data?.message ??
          'Nuk u gjet asnjë rezervim me këto të dhëna.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 lg:px-10 py-16">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold text-ink">
          Gjej rezervimin tënd
        </h1>
        <p className="mt-3 text-muted">
          Vendos kodin e rezervimit dhe email-in që përdore gjatë booking-ut.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Kodi i rezervimit
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="RES-2026-0001"
            required
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 font-mono text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="emri@example.com"
            required
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button type="submit" variant="primary" size="lg" className="w-full font-semibold" disabled={loading}>
          <Search className="h-4 w-4" />
          {loading ? 'Duke kërkuar…' : 'Kërko'}
        </Button>
      </form>

      {reservation && (
        <div className="mt-10 rounded-2xl border border-line bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Rezervimi
              </p>
              <p className="mt-1 font-mono text-xl font-bold text-ink">
                {reservation.reservation_code}
              </p>
            </div>
            <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold text-ink">
              {reservation.status.label}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted">Automjeti</p>
              <p className="mt-0.5 font-medium text-ink">{reservation.vehicle.full_name}</p>
            </div>
            <div>
              <p className="text-muted">Totali</p>
              <p className="mt-0.5 font-medium text-ink">
                {reservation.pricing.total.toFixed(2)}€
              </p>
            </div>
            <div>
              <p className="text-muted">Marrja</p>
              <p className="mt-0.5 font-medium text-ink">{formatDT(reservation.pickup_at)}</p>
            </div>
            <div>
              <p className="text-muted">Kthimi</p>
              <p className="mt-0.5 font-medium text-ink">{formatDT(reservation.return_at)}</p>
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
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
