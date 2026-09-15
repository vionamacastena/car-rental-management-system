import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Users, Fuel, Gauge, Calendar, MapPin, Check } from 'lucide-react'
import { useVehicle } from '@/hooks/useVehicle'

export default function VehicleDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { data: vehicle, isLoading, error } = useVehicle(id)
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-shell px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="aspect-[4/3] animate-pulse rounded-2xl bg-line/40" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-line/40" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-line/40" />
            <div className="h-24 animate-pulse rounded bg-line/40" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !vehicle) {
    return (
      <div className="mx-auto max-w-shell px-6 lg:px-10 py-32 text-center">
        <p className="font-display text-2xl font-bold text-ink">Automjeti nuk u gjet</p>
        <Link to="/fleet" className="mt-6 inline-block text-sm text-ink underline">
          Kthehu në flotë
        </Link>
      </div>
    )
  }

  const photos = vehicle.photos.length > 0 ? vehicle.photos : []
  const activePhoto = photos[activePhotoIndex]

  return (
    <div className="mx-auto max-w-shell px-6 lg:px-10 py-10">
      <Link
        to="/fleet"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Kthehu në flotë
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10">
        {/* Left: Gallery */}
        <div>
          <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-cream">
            {activePhoto ? (
              <img
                src={activePhoto.url}
                alt={vehicle.full_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl">🚗</div>
            )}
          </div>

          {photos.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {photos.map((photo, idx) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`aspect-[4/3] overflow-hidden rounded-lg border-2 transition-colors ${
                    idx === activePhotoIndex
                      ? 'border-ink'
                      : 'border-transparent hover:border-line'
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={`${vehicle.full_name} — ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div>
          <h1 className="font-display text-4xl font-bold text-ink">{vehicle.full_name}</h1>
          <p className="mt-2 text-muted">{vehicle.year}</p>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink">
            <Spec icon={<Gauge className="h-4 w-4" />} label={vehicle.transmission.label} />
            <Spec icon={<Fuel className="h-4 w-4" />} label={vehicle.fuel_type.label} />
            <Spec icon={<Users className="h-4 w-4" />} label={`${vehicle.seats} vende`} />
            <Spec icon={<Calendar className="h-4 w-4" />} label={`${vehicle.year}`} />
            {vehicle.location && (
              <Spec icon={<MapPin className="h-4 w-4" />} label={vehicle.location.name} />
            )}
          </div>

          {vehicle.description && (
            <p className="mt-6 text-sm leading-relaxed text-ink/80">{vehicle.description}</p>
          )}

          {/* Price card */}
          <div className="mt-8 rounded-2xl border border-line bg-white p-6">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted">Çmimi ditor</p>
                <p className="mt-1 font-display text-3xl font-bold text-ink">
                  €{vehicle.daily_price}
                  <span className="ml-1 text-base font-normal text-muted">/ ditë</span>
                </p>
              </div>
            </div>

            <Link
              to={`/booking/${vehicle.id}`}
              className="mt-5 flex h-12 w-full items-center justify-center rounded-lg bg-gold text-base font-semibold text-ink transition-colors hover:bg-gold/90"
            >
              Rezervo tani
            </Link>
            <p className="mt-3 text-center text-xs text-muted">
              Pa login · konfirmim në sekonda
            </p>
          </div>

          {/* Features */}
          {vehicle.features.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-lg font-semibold text-ink">Pajisje</h2>
              <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                {vehicle.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-ink/80">
                    <Check className="h-4 w-4 text-gold" strokeWidth={2.5} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Spec({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-muted">{icon}</span>
      {label}
    </span>
  )
}
