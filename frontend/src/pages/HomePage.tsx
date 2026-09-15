import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { HeroSearchBar } from '@/components/search/HeroSearchBar'
import { VehicleCard } from '@/components/vehicles/VehicleCard'
import { useVehicles } from '@/hooks/useVehicles'

export default function HomePage() {
  const { data, isLoading, error } = useVehicles({ per_page: 6, sort_by: 'daily_price' })

  return (
    <div>
      {/* HERO */}
      <section className="mx-auto max-w-shell px-6 lg:px-10 pt-16 pb-8">
        <div className="max-w-4xl">
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-ink">
            Merr rrugën. Ne
            <br />
            kujdesemi për makinën.
          </h1>
          <p className="mt-6 max-w-xl text-base md:text-lg text-muted leading-relaxed">
            Rezervo një automjet në Prishtinë, Prizren apo Pejë — pa logarí,
            pa fjalëkalim, në më pak se pesë minuta.
          </p>
        </div>
      </section>

      {/* SEARCH BAR */}
      <section className="mx-auto max-w-shell px-6 lg:px-10 pb-16">
        <HeroSearchBar />
      </section>

      {/* FEATURED VEHICLES */}
      <section className="mx-auto max-w-shell px-6 lg:px-10 pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-ink">
              Flota jonë
            </h2>
            <p className="mt-2 text-muted">Automjete të përzgjedhura për çdo udhëtim.</p>
          </div>
          <Link
            to="/fleet"
            className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-ink hover:text-gold transition-colors"
          >
            Shiko të gjitha
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-[16/10] animate-pulse rounded-2xl bg-line/40" />
            ))}
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Gabim gjatë ngarkimit: {(error as Error).message}
          </p>
        )}

        {data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.data.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
            <div className="mt-10 text-center md:hidden">
              <Link
                to="/fleet"
                className="inline-flex items-center gap-2 text-sm font-medium text-ink hover:text-gold"
              >
                Shiko të gjitha makinat
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
