import { Link, useLocation, useParams, Navigate } from 'react-router-dom'
import { CheckCircle2, MapPin, Calendar, Car as CarIcon, Mail } from 'lucide-react'
import type { Reservation } from '@/types/reservation'

export default function ConfirmationPage() {
  const { code } = useParams<{ code: string }>()
  const location = useLocation()
  const reservation = (location.state as { reservation?: Reservation } | null)?.reservation

  if (!reservation || reservation.reservation_code !== code) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="mx-auto max-w-3xl px-6 lg:px-10 py-16">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-9 w-9 text-green-600" />
        </div>
        <h1 className="mt-6 font-display text-4xl font-bold text-ink">
          Rezervimi u konfirmua!
        </h1>
        <p className="mt-3 text-muted">
          Të dërguam një email konfirmimi në{' '}
          <strong className="text-ink">{reservation.customer.email}</strong>
        </p>

        <div className="mt-6 inline-block rounded-xl border border-line bg-white px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Kodi i rezervimit
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-ink">
            {reservation.reservation_code}
          </p>
        </div>
      </div>

      <div className="mt-10 space-y-4">
        <Card icon={<CarIcon className="h-4 w-4" />} title="Automjeti">
          <p className="text-lg font-semibold text-ink">{reservation.vehicle.full_name}</p>
          <p className="text-sm text-muted">
            {reservation.vehicle.year} · {reservation.vehicle.transmission.label} ·{' '}
            {reservation.vehicle.fuel_type.label}
          </p>
        </Card>

        <Card icon={<Calendar className="h-4 w-4" />} title="Periudha">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted">Marrja</p>
              <p className="mt-0.5 font-medium text-ink">{formatDT(reservation.pickup_at)}</p>
            </div>
            <div>
              <p className="text-muted">Kthimi</p>
              <p className="mt-0.5 font-medium text-ink">{formatDT(reservation.return_at)}</p>
            </div>
          </div>
        </Card>

        <Card icon={<MapPin className="h-4 w-4" />} title="Lokacionet">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted">Marrja</p>
              <p className="mt-0.5 font-medium text-ink">{reservation.pickup_location.name}</p>
            </div>
            <div>
              <p className="text-muted">Kthimi</p>
              <p className="mt-0.5 font-medium text-ink">{reservation.return_location.name}</p>
            </div>
          </div>
        </Card>

        <Card icon={<Mail className="h-4 w-4" />} title="Përmbledhje çmimi">
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">{reservation.days} ditë</dt>
              <dd className="text-ink">{reservation.pricing.subtotal.toFixed(2)}€</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2 mt-2">
              <dt className="font-semibold text-ink">Totali</dt>
              <dd className="font-display text-lg font-bold text-ink">
                {reservation.pricing.total.toFixed(2)}€
              </dd>
            </div>
            <p className="text-xs text-muted">
              + depozita {reservation.pricing.deposit_amount.toFixed(2)}€ (bllokim, kthehet pas check-in)
            </p>
          </dl>
        </Card>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          to="/"
          className="inline-flex h-12 items-center justify-center rounded-lg bg-gold px-6 text-sm font-semibold text-ink transition-colors hover:bg-gold/90"
        >
          Kthehu në kryefaqe
        </Link>
        <Link
          to="/reservation/lookup"
          className="inline-flex h-12 items-center justify-center rounded-lg border border-ink/20 px-6 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-cream"
        >
          Shiko rezervimin tim
        </Link>
      </div>
    </div>
  )
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
        {icon}
        {title}
      </h3>
      {children}
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
