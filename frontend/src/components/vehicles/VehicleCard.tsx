import { Link } from 'react-router-dom'
import { Users, Fuel, Gauge } from 'lucide-react'
import type { Vehicle } from '@/types/vehicle'

interface VehicleCardProps {
  vehicle: Vehicle
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const photo = vehicle.primary_photo?.url ?? vehicle.photos[0]?.url

  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-lg hover:shadow-ink/5"
    >
      <div className="aspect-[16/10] overflow-hidden bg-cream">
        {photo ? (
          <img
            src={photo}
            alt={vehicle.full_name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🚗</div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold text-ink">{vehicle.full_name}</h3>
        <p className="mt-1 text-sm text-muted">{vehicle.year}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <Gauge className="h-3.5 w-3.5" />
            {vehicle.transmission.label}
          </span>
          <span className="text-line">·</span>
          <span className="inline-flex items-center gap-1">
            <Fuel className="h-3.5 w-3.5" />
            {vehicle.fuel_type.label}
          </span>
          <span className="text-line">·</span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {vehicle.seats} vende
          </span>
        </div>

        <div className="mt-auto pt-4">
          <p className="text-sm text-ink">
            <span className="font-semibold">Nga €{vehicle.daily_price}</span>
            <span className="text-muted"> / ditë</span>
          </p>
        </div>
      </div>
    </Link>
  )
}
