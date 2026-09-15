import { cn } from '@/lib/cn'
import type { RentalStatusValue } from '@/types/rental'

const STYLES: Record<RentalStatusValue, { bg: string; label: string }> = {
  pending_checkout: { bg: 'bg-blue-100 text-blue-800',     label: 'Pending Check-out' },
  active:           { bg: 'bg-amber-100 text-amber-800',   label: 'Active' },
  pending_checkin:  { bg: 'bg-indigo-100 text-indigo-800', label: 'Pending Check-in' },
  completed:        { bg: 'bg-green-100 text-green-800',   label: 'Completed' },
  cancelled:        { bg: 'bg-red-100 text-red-800',       label: 'Cancelled' },
}

export function RentalStatusBadge({ status }: { status: RentalStatusValue }) {
  const cfg = STYLES[status] ?? { bg: 'bg-gray-100 text-gray-700', label: status }
  return (
    <span className={cn('inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium', cfg.bg)}>
      {cfg.label}
    </span>
  )
}

export const RENTAL_STATUS_OPTIONS: { value: RentalStatusValue; label: string }[] = [
  { value: 'pending_checkout', label: 'Pending Check-out' },
  { value: 'active',           label: 'Active' },
  { value: 'pending_checkin',  label: 'Pending Check-in' },
  { value: 'completed',        label: 'Completed' },
  { value: 'cancelled',        label: 'Cancelled' },
]
