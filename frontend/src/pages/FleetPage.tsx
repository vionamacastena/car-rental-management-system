import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { VehicleCard } from '@/components/vehicles/VehicleCard'
import { FleetFilters } from '@/components/vehicles/FleetFilters'
import { useVehicles } from '@/hooks/useVehicles'
import { useLocations } from '@/hooks/useLocations'
import type { VehicleFilters } from '@/types/vehicle'

const DEFAULT_FILTERS: VehicleFilters = {
  sort_by: 'daily_price',
  sort_dir: 'asc',
  per_page: 12,
  page: 1,
}

export default function FleetPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const { data: locations } = useLocations()

  // Lexo filtrat nga URL
  const filters: VehicleFilters = useMemo(() => {
    const f: VehicleFilters = { ...DEFAULT_FILTERS }

    const pickupId = searchParams.get('pickup_location_id')
    if (pickupId) f.location_id = Number(pickupId)

    const brand = searchParams.get('brand')
    if (brand) f.brand = brand

    const fuel = searchParams.get('fuel_type')
    if (fuel) f.fuel_type = fuel.split(',') as VehicleFilters['fuel_type']

    const trans = searchParams.get('transmission')
    if (trans) f.transmission = trans.split(',') as VehicleFilters['transmission']

    const seats = searchParams.get('seats')
    if (seats) f.seats = Number(seats)

    const priceMax = searchParams.get('price_max')
    if (priceMax) f.price_max = Number(priceMax)

    const sortBy = searchParams.get('sort_by')
    if (sortBy) f.sort_by = sortBy as VehicleFilters['sort_by']

    const sortDir = searchParams.get('sort_dir')
    if (sortDir) f.sort_dir = sortDir as VehicleFilters['sort_dir']

    const page = searchParams.get('page')
    if (page) f.page = Number(page)

    return f
  }, [searchParams])

  const { data, isLoading, error } = useVehicles(filters)

  function updateFilters(patch: Partial<VehicleFilters>) {
    const next = new URLSearchParams(searchParams)

    const setOrDelete = (key: string, value: string | number | undefined | null) => {
      if (value === undefined || value === null || value === '') {
        next.delete(key)
      } else {
        next.set(key, String(value))
      }
    }

    if ('location_id' in patch) setOrDelete('pickup_location_id', patch.location_id)
    if ('brand' in patch) setOrDelete('brand', patch.brand)
    if ('fuel_type' in patch) {
      const v = patch.fuel_type
      setOrDelete('fuel_type', Array.isArray(v) ? v.join(',') : v)
    }
    if ('transmission' in patch) {
      const v = patch.transmission
      setOrDelete('transmission', Array.isArray(v) ? v.join(',') : v)
    }
    if ('seats' in patch) setOrDelete('seats', patch.seats)
    if ('price_max' in patch) setOrDelete('price_max', patch.price_max)
    if ('sort_by' in patch) setOrDelete('sort_by', patch.sort_by)
    if ('sort_dir' in patch) setOrDelete('sort_dir', patch.sort_dir)
    if ('page' in patch) setOrDelete('page', patch.page)

    setSearchParams(next)
  }

  function resetFilters() {
    setSearchParams(new URLSearchParams())
  }

  const hasActiveFilters = searchParams.toString() !== ''

  return (
    <div className="mx-auto max-w-shell px-6 lg:px-10 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-ink">Flota jonë</h1>
          <p className="mt-2 text-muted">
            {data ? `${data.meta.total} automjete të disponueshme` : 'Duke ngarkuar…'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium text-ink lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtrat
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
            >
              <X className="h-4 w-4" />
              Pastro filtrat
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        {/* Sidebar filters — desktop */}
        <aside className="hidden lg:block">
          <FleetFilters
            filters={filters}
            locations={locations ?? []}
            onChange={updateFilters}
          />
        </aside>

        {/* Mobile filters drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-ink/40"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto bg-cream p-5">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">Filtrat</h2>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="rounded-lg p-1.5 hover:bg-ink/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <FleetFilters
                filters={filters}
                locations={locations ?? []}
                onChange={(patch) => {
                  updateFilters(patch)
                  setMobileFiltersOpen(false)
                }}
              />
            </div>
          </div>
        )}

        {/* Grid */}
        <div>
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[16/10] animate-pulse rounded-2xl bg-line/40" />
              ))}
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Gabim: {(error as Error).message}
            </p>
          )}

          {data && data.data.length === 0 && (
            <div className="rounded-2xl border border-line bg-white p-12 text-center">
              <p className="font-display text-xl font-semibold text-ink">Asnjë automjet nuk u gjet</p>
              <p className="mt-2 text-sm text-muted">Provo të ndryshosh filtrat ose pastroji.</p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-6 rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-cream hover:bg-ink/90"
                >
                  Pastro filtrat
                </button>
              )}
            </div>
          )}

          {data && data.data.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {data.data.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>

              {/* Pagination */}
              {data.meta.last_page > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  {Array.from({ length: data.meta.last_page }).map((_, i) => {
                    const page = i + 1
                    const isActive = page === data.meta.current_page
                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => updateFilters({ page })}
                        className={`h-10 min-w-10 rounded-lg px-3 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-ink text-cream'
                            : 'border border-line bg-white text-ink hover:border-ink/30'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
