import { AlertCircle, MapPin, Calendar, User, Loader2 } from 'lucide-react'
import { AxiosError } from 'axios'
import { Button } from '@/components/ui/Button'
import { useBookingDraft } from '@/store/bookingDraft'
import { useVehicle } from '@/hooks/useVehicle'
import { useLocations } from '@/hooks/useLocations'
import { useCreateBooking } from '@/features/booking/useCreateBooking'
import type { ApiError } from '@/types/api'

interface Props {
  onBack: () => void
}

export function Step3Review({ onBack }: Props) {
  const { draft } = useBookingDraft()
  const { data: vehicle } = useVehicle(draft.vehicleId ?? undefined)
  const { data: locations } = useLocations()
  const createBooking = useCreateBooking()

  if (!vehicle) return null

  // Kalkulim i përafërt për preview (serveri bën final)
  const pickup = new Date(draft.pickupAt)
  const returnAt = new Date(draft.returnAt)
  const hours = (returnAt.getTime() - pickup.getTime()) / 3_600_000
  const days = Math.max(1, Math.ceil(hours / 24))
  const subtotal = days * vehicle.daily_price
  const deposit = 200
  const total = subtotal

  const pickupLoc = locations?.find((l) => l.id === draft.pickupLocationId)
  const returnLoc = locations?.find((l) => l.id === draft.returnLocationId)

  const errorMessage = (() => {
    const err = createBooking.error as AxiosError<ApiError> | null
    if (!err?.response) return null
    if (err.response.status === 409) {
      return err.response.data?.message ?? 'Automjeti nuk është i disponueshëm për këtë periudhë.'
    }
    if (err.response.status === 429) {
      return 'Shumë kërkesa. Provo përsëri pas një minute.'
    }
    const errs = err.response.data?.errors
    if (errs) return Object.values(errs).flat().join(' · ')
    return err.response.data?.message ?? 'Gabim gjatë rezervimit.'
  })()

  function handleConfirm() {
    createBooking.mutate({
      vehicle_id: vehicle!.id,
      pickup_location_id: draft.pickupLocationId!,
      return_location_id: draft.returnLocationId!,
      pickup_at: draft.pickupAt,
      return_at: draft.returnAt,
      first_name: draft.firstName,
      last_name: draft.lastName,
      email: draft.email,
      phone: draft.phone,
      address: draft.address || undefined,
      city: draft.city || undefined,
      country: draft.country || undefined,
      date_of_birth: draft.dateOfBirth || undefined,
      driver_license_number: draft.driverLicenseNumber || undefined,
      driver_license_expiry: draft.driverLicenseExpiry || undefined,
      notes: draft.notes || undefined,
      website: draft.website || undefined,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">Konfirmo rezervimin</h2>
        <p className="mt-1.5 text-sm text-muted">
          Kontrollo detajet para se të konfirmosh.
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Left: details */}
        <div className="space-y-5">
          {/* Vehicle */}
          <Card>
            <div className="flex gap-4">
              <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-cream">
                {vehicle.primary_photo?.url ? (
                  <img
                    src={vehicle.primary_photo.url}
                    alt={vehicle.full_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl">🚗</div>
                )}
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-ink">{vehicle.full_name}</h3>
                <p className="text-sm text-muted">
                  {vehicle.year} · {vehicle.transmission.label} · {vehicle.fuel_type.label}
                </p>
              </div>
            </div>
          </Card>

          {/* Period */}
          <Card title="Periudha" icon={<Calendar className="h-4 w-4" />}>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted">Marrja</dt>
                <dd className="mt-0.5 font-medium text-ink">{formatDateTime(draft.pickupAt)}</dd>
              </div>
              <div>
                <dt className="text-muted">Kthimi</dt>
                <dd className="mt-0.5 font-medium text-ink">{formatDateTime(draft.returnAt)}</dd>
              </div>
            </dl>
          </Card>

          {/* Locations */}
          <Card title="Lokacionet" icon={<MapPin className="h-4 w-4" />}>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted">Marrja</dt>
                <dd className="mt-0.5 font-medium text-ink">{pickupLoc?.name ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted">Kthimi</dt>
                <dd className="mt-0.5 font-medium text-ink">{returnLoc?.name ?? '—'}</dd>
              </div>
            </dl>
          </Card>

          {/* Customer */}
          <Card title="Klienti" icon={<User className="h-4 w-4" />}>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted">Emri</dt>
                <dd className="mt-0.5 font-medium text-ink">
                  {draft.firstName} {draft.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Telefoni</dt>
                <dd className="mt-0.5 font-medium text-ink">{draft.phone}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted">Email</dt>
                <dd className="mt-0.5 font-medium text-ink">{draft.email}</dd>
              </div>
            </dl>
          </Card>
        </div>

        {/* Right: price summary */}
        <div className="lg:sticky lg:top-24 h-fit">
          <Card>
            <h3 className="font-display text-lg font-bold text-ink">Përmbledhje çmimi</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label={`${vehicle.daily_price}€ × ${days} ditë`} value={`${subtotal.toFixed(2)}€`} />
              <Row label="Depozita (bllokim)" value={`${deposit.toFixed(2)}€`} muted />
              <div className="border-t border-line pt-2 mt-2">
                <Row label="Totali" value={`${total.toFixed(2)}€`} bold />
              </div>
            </dl>

            <Button
              onClick={handleConfirm}
              variant="primary"
              size="lg"
              disabled={createBooking.isPending}
              className="mt-5 w-full font-semibold"
            >
              {createBooking.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Duke konfirmuar…
                </>
              ) : (
                'Konfirmo rezervimin'
              )}
            </Button>

            <Button
              onClick={onBack}
              variant="ghost"
              size="md"
              disabled={createBooking.isPending}
              className="mt-2 w-full"
            >
              Kthehu
            </Button>

            <p className="mt-3 text-center text-xs text-muted">
              Duke konfirmuar, pranon termat dhe kushtet e shërbimit.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Card({
  title,
  icon,
  children,
}: {
  title?: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      {title && (
        <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-muted">
          {icon}
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}

function Row({
  label,
  value,
  muted,
  bold,
}: {
  label: string
  value: string
  muted?: boolean
  bold?: boolean
}) {
  return (
    <div className="flex justify-between">
      <dt className={muted ? 'text-muted' : 'text-ink'}>{label}</dt>
      <dd className={bold ? 'font-display text-lg font-bold text-ink' : muted ? 'text-muted' : 'text-ink'}>
        {value}
      </dd>
    </div>
  )
}

function formatDateTime(value: string): string {
  if (!value) return '—'
  const d = new Date(value)
  return d.toLocaleString('sq-AL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
