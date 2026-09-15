import {
  Plus, Pencil, Trash2, RefreshCw, XCircle, PenLine,
  RotateCcw, LogIn, LogOut, Activity,
} from 'lucide-react'
import { cn } from '@/lib/cn'

const ACTION_CONFIG: Record<string, { label: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  created:        { label: 'U krijua',      bg: 'bg-emerald-100 text-emerald-700', icon: Plus },
  updated:        { label: 'U përditësua',  bg: 'bg-blue-100 text-blue-700',       icon: Pencil },
  deleted:        { label: 'U fshi',        bg: 'bg-red-100 text-red-700',         icon: Trash2 },
  status_changed: { label: 'Statusi ndryshoi', bg: 'bg-amber-100 text-amber-700', icon: RefreshCw },
  cancelled:      { label: 'U anulua',      bg: 'bg-red-100 text-red-700',         icon: XCircle },
  signed:         { label: 'U nënshkrua',   bg: 'bg-purple-100 text-purple-700',   icon: PenLine },
  refunded:       { label: 'Rimbursim',     bg: 'bg-orange-100 text-orange-700',   icon: RotateCcw },
  checkout:       { label: 'Check-out',     bg: 'bg-cyan-100 text-cyan-700',       icon: LogOut },
  checkin:        { label: 'Check-in',      bg: 'bg-teal-100 text-teal-700',       icon: LogIn },
}

export function AuditActionBadge({ action }: { action: string }) {
  const cfg = ACTION_CONFIG[action] ?? { label: action, bg: 'bg-gray-100 text-gray-700', icon: Activity }
  const Icon = cfg.icon

  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium', cfg.bg)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  )
}

export const ENTITY_LABELS: Record<string, string> = {
  Vehicle: 'Automjet',
  Customer: 'Klient',
  Reservation: 'Rezervim',
  Rental: 'Rental',
  Payment: 'Pagesë',
  Invoice: 'Faturë',
  Contract: 'Kontratë',
  MaintenanceRecord: 'Maintenance',
  Location: 'Lokacion',
}

export function entityLabel(shortName: string): string {
  return ENTITY_LABELS[shortName] ?? shortName
}
