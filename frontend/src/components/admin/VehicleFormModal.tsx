import { useEffect, useState, type FormEvent } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { AxiosError } from 'axios'
import { Button } from '@/components/ui/Button'
import { FeaturesInput } from '@/components/admin/FeaturesInput'
import { STATUS_OPTIONS } from '@/components/admin/VehicleStatusBadge'
import {
  useCreateVehicle,
  useUpdateVehicle,
} from '@/hooks/admin/useAdminVehicles'
import { useLocations } from '@/hooks/useLocations'
import type { Vehicle, FuelTypeValue, TransmissionValue, VehicleStatusValue } from '@/types/vehicle'
import type { ApiError } from '@/types/api'
import type { VehiclePayload } from '@/services/admin/vehicles'

interface Props {
  vehicle: Vehicle | null
  onClose: () => void
}

const EMPTY: VehiclePayload = {
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  license_plate: '',
  vin: '',
  color: '',
  mileage: 0,
  fuel_type: 'petrol',
  transmission: 'manual',
  seats: 5,
  current_location_id: null,
  status: 'available',
  daily_price: 0,
  purchase_price: null,
  current_value: null,
  description: '',
  features: [],
}

const FUEL_OPTIONS: { value: FuelTypeValue; label: string }[] = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
]

const TRANSMISSION_OPTIONS: { value: TransmissionValue; label: string }[] = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatic', label: 'Automatic' },
]

export function VehicleFormModal({ vehicle, onClose }: Props) {
  const isEdit = !!vehicle
  const [form, setForm] = useState<VehiclePayload>(EMPTY)
  const [features, setFeatures] = useState<string[]>([])

  const { data: locations } = useLocations()
  const create = useCreateVehicle()
  const update = useUpdateVehicle()

  useEffect(() => {
    if (vehicle) {
      setForm({
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        license_plate: vehicle.license_plate,
        vin: vehicle.vin ?? '',
        color: vehicle.color ?? '',
        mileage: vehicle.mileage,
        fuel_type: vehicle.fuel_type.value,
        transmission: vehicle.transmission.value,
        seats: vehicle.seats,
        current_location_id: vehicle.location?.id ?? null,
        status: vehicle.status.value,
        daily_price: vehicle.daily_price,
        purchase_price: null,
        current_value: null,
        description: vehicle.description ?? '',
        features: vehicle.features ?? [],
      })
      setFeatures(vehicle.features ?? [])
    } else {
      setForm(EMPTY)
      setFeatures([])
    }
  }, [vehicle])

  const mutation = isEdit ? update : create

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const payload: VehiclePayload = {
      ...form,
      features,
      vin: form.vin || null,
      color: form.color || null,
      description: form.description || null,
      current_location_id: form.current_location_id || null,
    }

    if (isEdit && vehicle) {
      update.mutate({ id: vehicle.id, payload }, { onSuccess: onClose })
    } else {
      create.mutate(payload, { onSuccess: onClose })
    }
  }

  const errorMessage = (() => {
    const err = mutation.error as AxiosError<ApiError> | null
    if (!err?.response) return null
    const errs = err.response.data?.errors
    if (errs) return Object.values(errs).flat().join(' · ')
    return err.response.data?.message ?? 'Gabim gjatë ruajtjes.'
  })()

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-8">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl rounded-2xl bg-cream shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-line bg-cream px-6 py-4">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">
              {isEdit ? 'Ndrysho automjetin' : 'Shto automjet të re'}
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              {isEdit ? vehicle?.full_name : 'Plotëso të dhënat bazë për regjistrimin'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-ink/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section: Bazë */}
          <Section title="Informacione bazë">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Marka *">
                <TextInput
                  value={form.brand}
                  onChange={(v) => setForm({ ...form, brand: v })}
                  placeholder="BMW, Audi, Mercedes…"
                  required
                />
              </Field>
              <Field label="Modeli *">
                <TextInput
                  value={form.model}
                  onChange={(v) => setForm({ ...form, model: v })}
                  placeholder="320d, A4, C-Class…"
                  required
                />
              </Field>
              <Field label="Viti *">
                <TextInput
                  type="number"
                  value={String(form.year)}
                  onChange={(v) => setForm({ ...form, year: Number(v) })}
                  min={1990}
                  max={new Date().getFullYear() + 1}
                  required
                />
              </Field>
              <Field label="Ngjyra">
                <TextInput
                  value={form.color ?? ''}
                  onChange={(v) => setForm({ ...form, color: v })}
                  placeholder="Black, White, Red…"
                />
              </Field>
            </div>
          </Section>

          {/* Section: Identifikimi */}
          <Section title="Identifikimi">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Targa *">
                <TextInput
                  value={form.license_plate}
                  onChange={(v) => setForm({ ...form, license_plate: v.toUpperCase() })}
                  placeholder="01-ABC-123"
                  required
                  className="font-mono"
                />
              </Field>
              <Field label="VIN (numri i shasisë)">
                <TextInput
                  value={form.vin ?? ''}
                  onChange={(v) => setForm({ ...form, vin: v.toUpperCase() })}
                  placeholder="WBA5E51050G123456"
                  className="font-mono"
                />
              </Field>
            </div>
          </Section>

          {/* Section: Specifikime */}
          <Section title="Specifikime teknike">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Karburanti *">
                <Select
                  value={form.fuel_type}
                  onChange={(v) => setForm({ ...form, fuel_type: v as FuelTypeValue })}
                >
                  {FUEL_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Transmisioni *">
                <Select
                  value={form.transmission}
                  onChange={(v) => setForm({ ...form, transmission: v as TransmissionValue })}
                >
                  {TRANSMISSION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Vende *">
                <TextInput
                  type="number"
                  value={String(form.seats)}
                  onChange={(v) => setForm({ ...form, seats: Number(v) })}
                  min={1}
                  max={20}
                  required
                />
              </Field>
              <Field label="Kilometrazhi *">
                <TextInput
                  type="number"
                  value={String(form.mileage)}
                  onChange={(v) => setForm({ ...form, mileage: Number(v) })}
                  min={0}
                  required
                />
              </Field>
            </div>
          </Section>

          {/* Section: Çmimi */}
          <Section title="Çmimi & vlera">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Çmimi ditor (€) *">
                <TextInput
                  type="number"
                  value={String(form.daily_price)}
                  onChange={(v) => setForm({ ...form, daily_price: Number(v) })}
                  min={0}
                  step={0.01}
                  required
                />
              </Field>
              <Field label="Çmimi i blerjes (€)">
                <TextInput
                  type="number"
                  value={form.purchase_price !== null && form.purchase_price !== undefined ? String(form.purchase_price) : ''}
                  onChange={(v) => setForm({ ...form, purchase_price: v === '' ? null : Number(v) })}
                  min={0}
                  step={0.01}
                  placeholder="Opsionale"
                />
              </Field>
              <Field label="Vlera aktuale (€)">
                <TextInput
                  type="number"
                  value={form.current_value !== null && form.current_value !== undefined ? String(form.current_value) : ''}
                  onChange={(v) => setForm({ ...form, current_value: v === '' ? null : Number(v) })}
                  min={0}
                  step={0.01}
                  placeholder="Opsionale"
                />
              </Field>
            </div>
          </Section>

          {/* Section: Statusi & Lokacioni */}
          <Section title="Statusi & lokacioni">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Lokacioni aktual">
                <Select
                  value={form.current_location_id ? String(form.current_location_id) : ''}
                  onChange={(v) =>
                    setForm({ ...form, current_location_id: v ? Number(v) : null })
                  }
                >
                  <option value="">— Pa caktuar —</option>
                  {locations?.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Statusi *">
                <Select
                  value={form.status}
                  onChange={(v) => setForm({ ...form, status: v as VehicleStatusValue })}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </Field>
            </div>
          </Section>

          {/* Section: Përshkrimi */}
          <Section title="Përshkrimi">
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="Përshkrim i shkurtër i automjetit për klientët…"
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30 resize-y"
            />
          </Section>

          {/* Section: Pajisje */}
          <Section title="Pajisje / Features">
            <FeaturesInput value={features} onChange={setFeatures} />
          </Section>

          {/* Actions */}
          <div className="sticky bottom-0 -mx-6 flex justify-end gap-3 border-t border-line bg-cream px-6 py-4 rounded-b-2xl">
            <Button type="button" variant="outline" size="md" onClick={onClose}>
              Anulo
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="font-semibold"
              disabled={mutation.isPending}
            >
              {mutation.isPending
                ? 'Duke ruajtur…'
                : isEdit
                  ? 'Ruaj ndryshimet'
                  : 'Shto automjetin'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ---- Helpers ---- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
        {title}
      </h3>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      {children}
    </div>
  )
}

interface TextInputProps {
  value: string
  onChange: (v: string) => void
  type?: 'text' | 'number' | 'email'
  placeholder?: string
  required?: boolean
  min?: number
  max?: number
  step?: number
  className?: string
}

function TextInput({
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  min,
  max,
  step,
  className = '',
}: TextInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      min={min}
      max={max}
      step={step}
      className={`w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30 ${className}`}
    />
  )
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30"
    >
      {children}
    </select>
  )
}
