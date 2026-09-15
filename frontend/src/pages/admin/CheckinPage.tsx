import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Gauge, Fuel, Camera, Plus, X, FileCheck, Wallet, AlertCircle } from 'lucide-react'
import { AxiosError } from 'axios'
import { Button } from '@/components/ui/Button'
import { SignaturePad } from '@/components/admin/SignaturePad'
import { RentalStatusBadge } from '@/components/admin/RentalStatusBadge'
import { useAdminRental } from '@/hooks/admin/useAdminRentals'
import { useCheckinRental, type CheckinPayload, type NewDamage } from '@/features/rentals/useCheckinRental'
import type { ApiError } from '@/types/api'

const EXTERIOR_OPTIONS = [
  { value: 'good', label: 'E mirë' },
  { value: 'minor_scratches', label: 'Gërvishtje të vogla' },
  { value: 'damaged', label: 'E dëmtuar' },
] as const

const INTERIOR_OPTIONS = [
  { value: 'clean', label: 'E pastër' },
  { value: 'minor_dirt', label: 'Pak e papastër' },
  { value: 'damaged', label: 'E dëmtuar' },
] as const

const DAMAGE_AREAS = [
  'front_bumper', 'rear_bumper', 'hood', 'roof', 'trunk',
  'left_door', 'right_door', 'left_fender', 'right_fender',
  'windshield', 'rear_window', 'left_mirror', 'right_mirror',
  'wheel_front_left', 'wheel_front_right', 'wheel_rear_left', 'wheel_rear_right',
  'interior', 'other',
]

const DAMAGE_TYPES = [
  { value: 'scratch', label: 'Gërvishtje' },
  { value: 'dent', label: 'Gropë' },
  { value: 'broken_part', label: 'Pjesë e thyer' },
  { value: 'glass_damage', label: 'Dëmtim xhami' },
  { value: 'tire_damage', label: 'Dëmtim gome' },
  { value: 'interior_damage', label: 'Dëmtim i brendshëm' },
  { value: 'other', label: 'Tjetër' },
]

const SEVERITY_OPTIONS = [
  { value: 'minor', label: 'E lehtë' },
  { value: 'moderate', label: 'Mesatare' },
  { value: 'severe', label: 'E rëndë' },
] as const

export default function CheckinPage() {
  const { id } = useParams<{ id: string }>()
  const rentalId = Number(id)
  const { data: rental, isLoading } = useAdminRental(rentalId)
  const checkin = useCheckinRental(rentalId)

  const [form, setForm] = useState({
    return_mileage: 0,
    return_fuel_level: 100,
    exterior: 'good' as 'good' | 'minor_scratches' | 'damaged',
    interior: 'clean' as 'clean' | 'minor_dirt' | 'damaged',
    notes: '',
    signature: null as string | null,
    fuel_charge: 0,
    damage_charge: 0,
    extra_mileage_charge: 0,
    late_return_charge: 0,
    other_charges: 0,
  })

  const [damages, setDamages] = useState<NewDamage[]>([])

  const mileageUsed = useMemo(() => {
    if (!rental?.mileage.pickup) return 0
    return Math.max(0, form.return_mileage - rental.mileage.pickup)
  }, [rental, form.return_mileage])

  const totalCharges = form.fuel_charge + form.damage_charge +
    form.extra_mileage_charge + form.late_return_charge + form.other_charges

  const depositDeduction = Math.min(totalCharges, rental?.pricing.deposit_amount ?? 0)
  const depositRefund = Math.max(0, (rental?.pricing.deposit_amount ?? 0) - totalCharges)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="h-8 w-1/2 animate-pulse rounded bg-line/40" />
      </div>
    )
  }

  if (!rental) {
    return (
      <div className="text-center py-16">
        <p className="font-display text-xl font-bold text-ink">Rentali nuk u gjet</p>
        <Link to="/admin/rentals" className="mt-4 inline-block text-sm text-ink underline">
          Kthehu
        </Link>
      </div>
    )
  }

  if (rental.status.value !== 'active') {
    return (
      <div className="text-center py-16">
        <p className="font-display text-xl font-bold text-ink">Check-in nuk është i mundur</p>
        <p className="mt-2 text-sm text-muted">
          Statusi aktual: <RentalStatusBadge status={rental.status.value} />
        </p>
        <Link to="/admin/rentals" className="mt-6 inline-block text-sm text-ink underline">
          Kthehu në rentals
        </Link>
      </div>
    )
  }

  function addDamage() {
    setDamages([
      ...damages,
      { area: 'front_bumper', type: 'scratch', severity: 'minor', description: '', estimated_cost: 0 },
    ])
  }

  function updateDamage(index: number, patch: Partial<NewDamage>) {
    setDamages(damages.map((d, i) => (i === index ? { ...d, ...patch } : d)))
  }

  function removeDamage(index: number) {
    setDamages(damages.filter((_, i) => i !== index))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload: CheckinPayload = {
      return_mileage: form.return_mileage,
      return_fuel_level: form.return_fuel_level,
      checkin_condition: {
        exterior: form.exterior,
        interior: form.interior,
        new_damages: damages.length > 0 ? damages : undefined,
      },
      checkin_notes: form.notes || undefined,
      checkin_signature: form.signature || undefined,
      fuel_charge: form.fuel_charge || undefined,
      damage_charge: form.damage_charge || undefined,
      extra_mileage_charge: form.extra_mileage_charge || undefined,
      late_return_charge: form.late_return_charge || undefined,
      other_charges: form.other_charges || undefined,
    }
    checkin.mutate(payload)
  }

  const errorMessage = (() => {
    const err = checkin.error as AxiosError<ApiError> | null
    if (!err?.response) return null
    const errs = err.response.data?.errors
    if (errs) return Object.values(errs).flat().join(' · ')
    return err.response.data?.message ?? 'Gabim gjatë check-in.'
  })()

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to="/admin/rentals"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Kthehu në rentals
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink">Check-in</h1>
        <p className="mt-1.5 text-sm text-muted">
          Regjistro kthimin e automjetit — <strong className="text-ink">{rental.rental_code}</strong>
        </p>
      </div>

      {/* Summary */}
      <div className="mb-6 rounded-2xl border border-line bg-white p-5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted">Klienti</p>
            <p className="mt-0.5 font-medium text-ink">{rental.customer.full_name}</p>
          </div>
          <div>
            <p className="text-muted">Automjeti</p>
            <p className="mt-0.5 font-medium text-ink">{rental.vehicle.full_name}</p>
          </div>
          <div>
            <p className="text-muted">Km në dorëzim</p>
            <p className="mt-0.5 font-medium text-ink">
              {rental.mileage.pickup?.toLocaleString('sq-AL') ?? '—'} km
            </p>
          </div>
          <div>
            <p className="text-muted">Depozita</p>
            <p className="mt-0.5 font-medium text-ink">
              {rental.pricing.deposit_amount.toFixed(2)}€
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Section: Gjendja e makinës në kthim */}
        <Card icon={<Gauge className="h-4 w-4" />} title="Gjendja në kthim">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Kilometrazhi i kthimit (km) *">
              <input
                type="number"
                min={rental.mileage.pickup ?? 0}
                required
                value={form.return_mileage}
                onChange={(e) => setForm({ ...form, return_mileage: Number(e.target.value) })}
                className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
              {mileageUsed > 0 && (
                <p className="mt-1 text-xs text-muted">
                  Km të përdorura: <strong className="text-ink">{mileageUsed.toLocaleString('sq-AL')} km</strong>
                </p>
              )}
            </Field>

            <Field label={`Niveli i karburantit në kthim: ${form.return_fuel_level}%`} icon={<Fuel className="h-4 w-4" />}>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={form.return_fuel_level}
                onChange={(e) => setForm({ ...form, return_fuel_level: Number(e.target.value) })}
                className="w-full accent-gold"
              />
              {rental.fuel.pickup_level !== null && (
                <p className="mt-1 text-xs text-muted">
                  Në dorëzim: {rental.fuel.pickup_level}%
                </p>
              )}
            </Field>
          </div>
        </Card>

        {/* Section: Kondita */}
        <Card icon={<Camera className="h-4 w-4" />} title="Kondita e makinës">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Gjendja e jashtme">
              <select
                value={form.exterior}
                onChange={(e) => setForm({ ...form, exterior: e.target.value as typeof form.exterior })}
                className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30"
              >
                {EXTERIOR_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Gjendja e brendshme">
              <select
                value={form.interior}
                onChange={(e) => setForm({ ...form, interior: e.target.value as typeof form.interior })}
                className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30"
              >
                {INTERIOR_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
          </div>
        </Card>

        {/* Section: Dëmet e reja */}
        <Card icon={<AlertCircle className="h-4 w-4" />} title="Dëmet e reja">
          {damages.length === 0 ? (
            <p className="text-sm text-muted">Nuk u regjistruan dëme të reja.</p>
          ) : (
            <div className="space-y-3">
              {damages.map((d, i) => (
                <div key={i} className="rounded-xl border border-line bg-cream/40 p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Field label="Zona">
                      <select
                        value={d.area}
                        onChange={(e) => updateDamage(i, { area: e.target.value })}
                        className="w-full rounded-lg border border-line bg-white px-2 py-1.5 text-sm"
                      >
                        {DAMAGE_AREAS.map((a) => (
                          <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Tipi">
                      <select
                        value={d.type}
                        onChange={(e) => updateDamage(i, { type: e.target.value })}
                        className="w-full rounded-lg border border-line bg-white px-2 py-1.5 text-sm"
                      >
                        {DAMAGE_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Ashpërsia">
                      <select
                        value={d.severity}
                        onChange={(e) => updateDamage(i, { severity: e.target.value as NewDamage['severity'] })}
                        className="w-full rounded-lg border border-line bg-white px-2 py-1.5 text-sm"
                      >
                        {SEVERITY_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={d.description ?? ''}
                      onChange={(e) => updateDamage(i, { description: e.target.value })}
                      placeholder="Përshkrim (opsionale)"
                      className="flex-1 rounded-lg border border-line bg-white px-2 py-1.5 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeDamage(i)}
                      className="rounded-lg border border-line bg-white px-2.5 text-muted hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button type="button" variant="outline" size="sm" onClick={addDamage}>
            <Plus className="h-4 w-4" />
            Shto dëm të re
          </Button>
        </Card>

        {/* Section: Charges shtesë */}
        <Card icon={<Wallet className="h-4 w-4" />} title="Tarifat shtesë">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Karburanti (€)">
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.fuel_charge}
                onChange={(e) => setForm({ ...form, fuel_charge: Number(e.target.value) })}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Dëmet (€)">
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.damage_charge}
                onChange={(e) => setForm({ ...form, damage_charge: Number(e.target.value) })}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Km shtesë (€)">
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.extra_mileage_charge}
                onChange={(e) => setForm({ ...form, extra_mileage_charge: Number(e.target.value) })}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Vonesë (€)">
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.late_return_charge}
                onChange={(e) => setForm({ ...form, late_return_charge: Number(e.target.value) })}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Tjera (€)">
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.other_charges}
                onChange={(e) => setForm({ ...form, other_charges: Number(e.target.value) })}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
              />
            </Field>
          </div>
        </Card>

        {/* Section: Përmbledhje financiare */}
        <Card icon={<Wallet className="h-4 w-4" />} title="Përmbledhje financiare">
          <dl className="space-y-2 text-sm">
            <Row label="Tarifa bazë" value={`${rental.pricing.base_amount.toFixed(2)}€`} />
            <Row label="Tarifat shtesë" value={`${totalCharges.toFixed(2)}€`} />
            <div className="border-t border-line pt-2 mt-2">
              <Row label="Totali final" value={`${(rental.pricing.base_amount + totalCharges).toFixed(2)}€`} bold />
            </div>
            <Row label="Depozita" value={`${rental.pricing.deposit_amount.toFixed(2)}€`} muted />
            <Row label="Zbritje nga depozita" value={`-${depositDeduction.toFixed(2)}€`} muted />
            <Row label="Rimbursim" value={`${depositRefund.toFixed(2)}€`} muted />
          </dl>
        </Card>

        {/* Section: Shënime + Firma */}
        <Card icon={<FileCheck className="h-4 w-4" />} title="Shënime & Firma">
          <Field label="Shënime">
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Shënime shtesë për check-in"
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm resize-y"
            />
          </Field>

          <SignaturePad
            value={form.signature}
            onChange={(v) => setForm({ ...form, signature: v })}
            label="Firma e klientit"
          />
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            to="/admin/rentals"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-ink/20 px-5 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-cream"
          >
            Anulo
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="font-semibold"
            disabled={checkin.isPending}
          >
            {checkin.isPending ? 'Duke përfunduar…' : 'Përfundo Check-in'}
          </Button>
        </div>
      </form>
    </div>
  )
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
        {icon}
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink">
        {icon && <span className="text-muted">{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  )
}

function Row({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className={muted ? 'text-muted' : 'text-ink'}>{label}</dt>
      <dd className={bold ? 'font-display text-lg font-bold text-ink' : muted ? 'text-muted' : 'text-ink'}>
        {value}
      </dd>
    </div>
  )
}
