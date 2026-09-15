import { cn } from '@/lib/cn'
import type { ReservationStatusValue } from '@/types/reservation'

const STYLES: Record<ReservationStatusValue, { bg: string; label: string }> = {
  inquiry:        { bg: 'bg-gray-100 text-gray-700',   label: 'Inquiry' },
  reserved:       { bg: 'bg-blue-100 text-blue-800',   label: 'Reserved' },
  picked_up:      { bg: 'bg-indigo-100 text-indigo-800', label: 'Picked Up' },
  active:         { bg: 'bg-amber-100 text-amber-800', label: 'Active' },
  returned:       { bg: 'bg-teal-100 text-teal-800',   label: 'Returned' },
  completed:      { bg: 'bg-green-100 text-green-800', label: 'Completed' },
  cancelled:      { bg: 'bg-red-100 text-red-800',     label: 'Cancelled' },
  no_show:        { bg: 'bg-gray-200 text-gray-600',   label: 'No Show' },
  overdue:        { bg: 'bg-red-200 text-red-900',     label: 'Overdue' },
}

export function ReservationStatusBadge({ status }: { status: ReservationStatusValue }) {
  const cfg = STYLES[status] ?? { bg: 'bg-gray-100 text-gray-700', label: status }
  return (
    <span className={cn('inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium', cfg.bg)}>
      {cfg.label}
    </span>
  )
}

export const RESERVATION_STATUS_OPTIONS: { value: ReservationStatusValue; label: string }[] = [
  { value: 'inquiry',   label: 'Inquiry' },
  { value: 'reserved',  label: 'Reserved' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'active',    label: 'Active' },
  { value: 'returned',  label: 'Returned' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show',   label: 'No Show' },
  { value: 'overdue',   label: 'Overdue' },
]
