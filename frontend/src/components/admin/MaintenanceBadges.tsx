import { cn } from '@/lib/cn'
import type { MaintenanceStatusValue, MaintenanceTypeValue } from '@/types/maintenance'

const STATUS_STYLES: Record<MaintenanceStatusValue, { bg: string; label: string }> = {
  scheduled:   { bg: 'bg-blue-100 text-blue-800',     label: 'Planifikuar' },
  in_progress: { bg: 'bg-amber-100 text-amber-800',   label: 'Në proces' },
  completed:   { bg: 'bg-green-100 text-green-800',   label: 'Përfunduar' },
  cancelled:   { bg: 'bg-red-100 text-red-800',       label: 'Anuluar' },
}

const TYPE_STYLES: Record<MaintenanceTypeValue, string> = {
  oil_change:   'bg-slate-100 text-slate-700',
  tires:        'bg-zinc-100 text-zinc-700',
  brakes:       'bg-rose-50 text-rose-700',
  service:      'bg-indigo-50 text-indigo-700',
  repair:       'bg-orange-50 text-orange-700',
  inspection:   'bg-cyan-50 text-cyan-700',
  registration: 'bg-teal-50 text-teal-700',
  insurance:    'bg-blue-50 text-blue-700',
  washing:      'bg-sky-50 text-sky-700',
  detailing:    'bg-violet-50 text-violet-700',
  other:        'bg-gray-100 text-gray-700',
}

export function MaintenanceStatusBadge({ status }: { status: MaintenanceStatusValue }) {
  const cfg = STATUS_STYLES[status] ?? { bg: 'bg-gray-100 text-gray-700', label: status }
  return (
    <span className={cn('inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium', cfg.bg)}>
      {cfg.label}
    </span>
  )
}

export function MaintenanceTypeBadge({ type, label }: { type: MaintenanceTypeValue; label: string }) {
  return (
    <span className={cn('inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium', TYPE_STYLES[type] ?? TYPE_STYLES.other)}>
      {label}
    </span>
  )
}

export const MAINTENANCE_STATUS_OPTIONS: { value: MaintenanceStatusValue; label: string }[] = [
  { value: 'scheduled',   label: 'Planifikuar' },
  { value: 'in_progress', label: 'Në proces' },
  { value: 'completed',   label: 'Përfunduar' },
  { value: 'cancelled',   label: 'Anuluar' },
]

export const MAINTENANCE_TYPE_OPTIONS: { value: MaintenanceTypeValue; label: string }[] = [
  { value: 'oil_change',   label: 'Ndryshim vaji' },
  { value: 'tires',        label: 'Goma' },
  { value: 'brakes',       label: 'Frena' },
  { value: 'service',      label: 'Servis' },
  { value: 'repair',       label: 'Riparim' },
  { value: 'inspection',   label: 'Inspektim teknik' },
  { value: 'registration', label: 'Regjistrim' },
  { value: 'insurance',    label: 'Sigurim' },
  { value: 'washing',      label: 'Larje' },
  { value: 'detailing',    label: 'Detailing' },
  { value: 'other',        label: 'Tjetër' },
]
