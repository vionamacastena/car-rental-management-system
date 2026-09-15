import { cn } from '@/lib/cn'
import type { VehicleStatusValue } from '@/types/vehicle'

const STYLES: Record<VehicleStatusValue, { bg: string; label: string }> = {
  available: { bg: 'bg-green-100 text-green-800', label: 'Available' },
  reserved: { bg: 'bg-blue-100 text-blue-800', label: 'Reserved' },
  rented: { bg: 'bg-amber-100 text-amber-800', label: 'Rented' },
  cleaning: { bg: 'bg-cyan-100 text-cyan-800', label: 'Cleaning' },
  maintenance: { bg: 'bg-purple-100 text-purple-800', label: 'Maintenance' },
  damaged: { bg: 'bg-red-100 text-red-800', label: 'Damaged' },
  out_of_service: { bg: 'bg-gray-200 text-gray-700', label: 'Out of Service' },
  sold: { bg: 'bg-gray-100 text-gray-500', label: 'Sold' },
}

export function VehicleStatusBadge({ status }: { status: VehicleStatusValue }) {
  const cfg = STYLES[status] ?? { bg: 'bg-gray-100 text-gray-700', label: status }
  return (
    <span className={cn('inline-block rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap', cfg.bg)}>
      {cfg.label}
    </span>
  )
}

export const STATUS_OPTIONS: { value: VehicleStatusValue; label: string }[] = [
  { value: 'available', label: 'Available' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'rented', label: 'Rented' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'out_of_service', label: 'Out of Service' },
  { value: 'sold', label: 'Sold' },
]
