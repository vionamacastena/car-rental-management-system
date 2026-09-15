import { useEffect, useState } from 'react'
import type { Location, VehicleFilters, FuelTypeValue, TransmissionValue } from '@/types/vehicle'

interface FleetFiltersProps {
  filters: VehicleFilters
  locations: Location[]
  onChange: (patch: Partial<VehicleFilters>) => void
}

const FUEL_TYPES: { value: FuelTypeValue; label: string }[] = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
]

const TRANSMISSIONS: { value: TransmissionValue; label: string }[] = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatic', label: 'Automatic' },
]

const SEAT_OPTIONS = [2, 4, 5, 7]

const MAX_PRICE = 200

export function FleetFilters({ filters, locations, onChange }: FleetFiltersProps) {
  const [priceMax, setPriceMax] = useState<number>(filters.price_max ?? MAX_PRICE)

  useEffect(() => {
    setPriceMax(filters.price_max ?? MAX_PRICE)
  }, [filters.price_max])

  const fuelArr = filters.fuel_type
    ? Array.isArray(filters.fuel_type) ? filters.fuel_type : [filters.fuel_type]
    : []

  const transArr = filters.transmission
    ? Array.isArray(filters.transmission) ? filters.transmission : [filters.transmission]
    : []

  function toggleFuel(value: FuelTypeValue) {
    const next = fuelArr.includes(value)
      ? fuelArr.filter((v) => v !== value)
      : [...fuelArr, value]
    onChange({ fuel_type: next, page: 1 })
  }

  function toggleTransmission(value: TransmissionValue) {
    const next = transArr.includes(value)
      ? transArr.filter((v) => v !== value)
      : [...transArr, value]
    onChange({ transmission: next, page: 1 })
  }

  function commitPrice(value: number) {
    onChange({
      price_max: value >= MAX_PRICE ? undefined : value,
      page: 1,
    })
  }

  return (
    <div className="space-y-6 rounded-2xl border border-line bg-white p-5">
      <Section title="Lokacioni">
        <select
          value={filters.location_id ?? ''}
          onChange={(e) =>
            onChange({
              location_id: e.target.value ? Number(e.target.value) : undefined,
              page: 1,
            })
          }
          className="w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink focus:border-ink/30 focus:outline-none"
        >
          <option value="">Të gjitha lokacionet</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
      </Section>

      <Section title="Marka">
        <input
          type="text"
          value={filters.brand ?? ''}
          onChange={(e) => onChange({ brand: e.target.value || undefined, page: 1 })}
          placeholder="p.sh. BMW, Audi…"
          className="w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-ink/30 focus:outline-none"
        />
      </Section>

      <Section title="Transmisioni">
        <div className="space-y-2">
          {TRANSMISSIONS.map(({ value, label }) => (
            <Checkbox
              key={value}
              checked={transArr.includes(value)}
              onChange={() => toggleTransmission(value)}
              label={label}
            />
          ))}
        </div>
      </Section>

      <Section title="Karburanti">
        <div className="space-y-2">
          {FUEL_TYPES.map(({ value, label }) => (
            <Checkbox
              key={value}
              checked={fuelArr.includes(value)}
              onChange={() => toggleFuel(value)}
              label={label}
            />
          ))}
        </div>
      </Section>

      <Section title="Vende">
        <div className="flex flex-wrap gap-2">
          {SEAT_OPTIONS.map((n) => {
            const active = filters.seats === n
            return (
              <button
                key={n}
                type="button"
                onClick={() => onChange({ seats: active ? undefined : n, page: 1 })}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'border-ink bg-ink text-cream'
                    : 'border-line bg-cream text-ink hover:border-ink/30'
                }`}
              >
                {n}+
              </button>
            )
          })}
        </div>
      </Section>

      <Section title={`Çmimi max: €${priceMax}`}>
        <input
          type="range"
          min={20}
          max={MAX_PRICE}
          step={5}
          value={priceMax}
          onChange={(e) => setPriceMax(Number(e.target.value))}
          onMouseUp={(e) => commitPrice(Number((e.target as HTMLInputElement).value))}
          onTouchEnd={(e) => commitPrice(Number((e.target as HTMLInputElement).value))}
          className="w-full accent-gold"
        />
        <div className="mt-1 flex justify-between text-xs text-muted">
          <span>€20</span>
          <span>€{MAX_PRICE}+</span>
        </div>
      </Section>

      <Section title="Rendit sipas">
        <select
          value={`${filters.sort_by ?? 'daily_price'}:${filters.sort_dir ?? 'asc'}`}
          onChange={(e) => {
            const [sort_by, sort_dir] = e.target.value.split(':')
            onChange({
              sort_by: sort_by as VehicleFilters['sort_by'],
              sort_dir: sort_dir as VehicleFilters['sort_dir'],
              page: 1,
            })
          }}
          className="w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink focus:border-ink/30 focus:outline-none"
        >
          <option value="daily_price:asc">Çmimi: nga më i ulëti</option>
          <option value="daily_price:desc">Çmimi: nga më i larti</option>
          <option value="year:desc">Viti: më i ri</option>
          <option value="year:asc">Viti: më i vjetër</option>
          <option value="brand:asc">Marka: A–Z</option>
          <option value="mileage:asc">Kilometrazhi: më i ulët</option>
        </select>
      </Section>
    </div>
  )
}

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

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: () => void
  label: string
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-line text-ink accent-ink focus:ring-gold"
      />
      {label}
    </label>
  )
}
