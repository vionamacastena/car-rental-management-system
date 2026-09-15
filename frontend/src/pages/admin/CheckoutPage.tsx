import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Gauge, Fuel, Camera, FileCheck } from 'lucide-react'
import { AxiosError } from 'axios'
import { Button } from '@/components/ui/Button'
import { SignaturePad } from '@/components/admin/SignaturePad'
import { RentalStatusBadge } from '@/components/admin/RentalStatusBadge'
import { useAdminRental } from '@/hooks/admin/useAdminRentals'
import { useCheckoutRental, type CheckoutPayload } from '@/features/rentals/useCheckoutRental'
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

export default function CheckoutPage() {
  const { id } = useParams<{ id: string }>()
  const rentalId = Number(id)
  const { data: rental, isLoading } = useAdminRental(rentalId)
  const checkout = useCheckoutRental(rentalId)

  const [form, setForm] = useState({
    pickup_mileage: 0,
    pickup_fuel_level: 100,
    exterior: 'good' as 'good' | 'minor_scratches' | 'damaged',
    interior: 'clean' as 'clean' | 'minor_dirt' | 'damaged',
    existing_damages: '',
    notes: '',
    signature: null as string | null,
  })

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

  if (rental.status.value !== 'pending_checkout') {
    return (
      <div className="text-center py-16">
        <p className="font-display text-xl font-bold text-ink">
          Check-out nuk është i mundur
        </p>
        <p className="mt-2 text-sm text-muted">
          Statusi aktual: <RentalStatusBadge status={rental.status.value} />
        </p>
        <Link to="/admin/rentals" className="mt-6 inline-block text-sm text-ink underline">
          Kthehu në rentals
        </Link>
      </div>
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload: CheckoutPayload = {
      pickup_mileage: form.pickup_mileage,
      pickup_fuel_level: form.pickup_fuel_level,
      checkout_condition: {
        exterior: form.exterior,
        interior: form.interior,
        existing_damages: form.existing_damages
          ? form.existing_damages.split('\n').map((s) => s.trim()).filter(Boolean)
          : [],
      },
      checkout_notes: form.notes || undefined,
      checkout_signature: form.signature || undefined,
    }
    checkout.mutate(payload)
  }

  const errorMessage = (() => {
    const err = checkout.error as AxiosError<ApiError> | null
    if (!err?.response) return null
    const errs = err.response.data?.errors
    if (errs) return Object.values(errs).flat().join(' · ')
    return err.response.data?.message ?? 'Gabim gjatë check-out.'
  })()

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/admin/rentals"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Kthehu në rentals
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink">Check-out</h1>
        <p className="mt-1.5 text-sm text-muted">
          Regjistro dorëzimin e automjetit — <strong className="text-ink">{rental.rental_code}</strong>
        </p>
      </div>

      {/* Summary */}
      <div className="mb-6 rounded-2xl border border-line bg-white p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted">Klienti</p>
            <p className="mt-0.5 font-medium text-ink">{rental.customer.full_name}</p>
          </div>
          <div>
            <p className="text-muted">Automjeti</p>
            <p className="mt-0.5 font-medium text-ink">{rental.vehicle.full_name}</p>
          </div>
          <div>
            <p className="text-muted">Targa</p>
            <p className="mt-0.5 font-mono font-medium text-ink">{rental.vehicle.license_plate}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Section: Gjendja e makinës */}
        <Card icon={<Gauge className="h-4 w-4" />} title="Gjendja e makinës">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Kilometrazhi aktual (km) *">
              <input
                type="number"
                min={rental.mileage.pickup ?? 0}
                required
                value={form.pickup_mileage}
                onChange={(e) => setForm({ ...form, pickup_mileage: Number(e.target.value) })}
                className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
            </Field>

            <Field label={`Niveli i karburantit: ${form.pickup_fuel_level}%`} icon={<Fuel className="h-4 w-4" />}>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={form.pickup_fuel_level}
                onChange={(e) => setForm({ ...form, pickup_fuel_level: Number(e.target.value) })}
                className="w-full accent-gold"
              />
              <div className="mt-1 flex justify-between text-xs text-muted">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
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

          <Field label="Dëmet ekzistuese (një për rresht)">
            <textarea
              rows={3}
              value={form.existing_damages}
              onChange={(e) => setForm({ ...form, existing_damages: e.target.value })}
              placeholder="p.sh. Gërvishtje në derën e majtë&#10;Dëmtim i vogël në bumperin e përparmë"
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30 resize-y"
            />
          </Field>

          <Field label="Shënime">
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Shënime shtesë për check-out"
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30 resize-y"
            />
          </Field>
        </Card>

        {/* Section: Firma */}
        <Card icon={<FileCheck className="h-4 w-4" />} title="Firma e klientit">
          <SignaturePad
            value={form.signature}
            onChange={(v) => setForm({ ...form, signature: v })}
            label="Firma e klientit (pranon gjendjen e makinës)"
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
            disabled={checkout.isPending}
          >
            {checkout.isPending ? 'Duke ruajtur…' : 'Përfundo Check-out'}
          </Button>
        </div>
      </form>
    </div>
  )
}

function Card({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
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

function Field({
  label,
  icon,
  children,
}: {
  label: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
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
