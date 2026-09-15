import { Link } from 'react-router-dom'
import {
  Car, CalendarCheck, Users, Wallet, AlertTriangle,
  Wrench, ArrowRight, Bell,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useAdminVehicles } from '@/hooks/admin/useAdminVehicles'
import { useAdminReservations } from '@/hooks/admin/useAdminReservations'
import { useAdminCustomers } from '@/hooks/admin/useAdminCustomers'
import { useAdminPayments } from '@/hooks/admin/useAdminPayments'
import { useAdminMaintenance } from '@/hooks/admin/useAdminMaintenance'
import { useNotifications, useUnreadCount } from '@/hooks/admin/useNotifications'
import { cn } from '@/lib/cn'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  // Data fetches
  const { data: vehicles } = useAdminVehicles({ per_page: 1 })
  const { data: reservations } = useAdminReservations({ upcoming: true, per_page: 1 })
  const { data: customers } = useAdminCustomers({ per_page: 1 })
  const { data: payments } = useAdminPayments({ per_page: 100 })
  const { data: overdueMaint } = useAdminMaintenance({ overdue: true, per_page: 5 })
  const { data: upcomingMaint } = useAdminMaintenance({ upcoming_service: true, per_page: 5 })
  const { data: notifications } = useNotifications({ unread_only: true, per_page: 5 })
  const { data: unreadCount } = useUnreadCount()

  // Kalkulo revenue të sotëm / këtë muaj
  const totalRevenue = (payments?.data ?? [])
    .filter((p) => p.type.is_incoming)
    .reduce((sum, p) => sum + p.net_amount, 0)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink">
          Mirë se vini, {user?.name}
        </h1>
        <p className="mt-2 text-muted">
          Përmbledhje e aktivitetit të fundit.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPI
          icon={<Car className="h-5 w-5" />}
          label="Automjete gjithsej"
          value={String(vehicles?.meta.total ?? 0)}
          to="/admin/vehicles"
          color="blue"
        />
        <KPI
          icon={<CalendarCheck className="h-5 w-5" />}
          label="Rezervime aktive"
          value={String(reservations?.meta.total ?? 0)}
          to="/admin/reservations"
          color="amber"
        />
        <KPI
          icon={<Users className="h-5 w-5" />}
          label="Klientë"
          value={String(customers?.meta.total ?? 0)}
          to="/admin/customers"
          color="purple"
        />
        <KPI
          icon={<Wallet className="h-5 w-5" />}
          label="Të hyra (faqe aktuale)"
          value={`${totalRevenue.toFixed(2)}€`}
          to="/admin/payments"
          color="emerald"
        />
      </div>

      {/* Alerts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Maintenance overdue */}
        <Widget
          title="Maintenance të vonuara"
          icon={<AlertTriangle className="h-4 w-4" />}
          to="/admin/maintenance"
          count={overdueMaint?.meta.total ?? 0}
          variant={overdueMaint && overdueMaint.meta.total > 0 ? 'danger' : 'neutral'}
          empty="Asnjë maintenance i vonuar."
        >
          {overdueMaint?.data.map((m) => (
            <AlertRow
              key={m.id}
              title={`${m.vehicle.full_name} — ${m.title}`}
              subtitle={`${m.vehicle.license_plate} · Planifikuar: ${m.scheduled_at}`}
              badge={m.type.label}
            />
          ))}
        </Widget>

        {/* Upcoming service */}
        <Widget
          title="Servis brenda 30 ditësh"
          icon={<Wrench className="h-4 w-4" />}
          to="/admin/maintenance"
          count={upcomingMaint?.meta.total ?? 0}
          variant={upcomingMaint && upcomingMaint.meta.total > 0 ? 'warning' : 'neutral'}
          empty="Asnjë servis i planifikuar."
        >
          {upcomingMaint?.data.map((m) => (
            <AlertRow
              key={m.id}
              title={`${m.vehicle.full_name} — ${m.title}`}
              subtitle={`${m.vehicle.license_plate} · ${m.next_service_at} (${m.days_until_next_service}d)`}
              badge={m.type.label}
            />
          ))}
        </Widget>
      </div>

      {/* Recent notifications */}
      <Widget
        title="Njoftimet e palexuara"
        icon={<Bell className="h-4 w-4" />}
        count={unreadCount ?? 0}
        variant="neutral"
        empty="Nuk ka njoftime të palexuara."
      >
        {notifications?.data.map((n) => (
          <AlertRow
            key={n.id}
            title={n.title}
            subtitle={n.message}
            badge={n.human_time}
            to={n.url}
          />
        ))}
      </Widget>
    </div>
  )
}

function KPI({
  icon,
  label,
  value,
  to,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  to: string
  color: 'blue' | 'amber' | 'purple' | 'emerald'
}) {
  const colors = {
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
    purple: 'bg-purple-100 text-purple-700',
    emerald: 'bg-emerald-100 text-emerald-700',
  }

  return (
    <Link
      to={to}
      className="group rounded-2xl border border-line bg-white p-5 transition-all hover:border-ink/20 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', colors[color])}>
          {icon}
        </span>
        <ArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold text-ink">{value}</p>
    </Link>
  )
}

function Widget({
  title,
  icon,
  to,
  count,
  variant,
  empty,
  children,
}: {
  title: string
  icon: React.ReactNode
  to?: string
  count: number
  variant: 'danger' | 'warning' | 'neutral'
  empty: string
  children?: React.ReactNode
}) {
  const hasContent = count > 0

  const colors = {
    danger: 'border-red-200 bg-red-50/50',
    warning: 'border-amber-200 bg-amber-50/50',
    neutral: 'border-line bg-white',
  }

  const badgeColors = {
    danger: 'bg-red-100 text-red-700',
    warning: 'bg-amber-100 text-amber-700',
    neutral: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className={cn('rounded-2xl border p-5', colors[variant])}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
          {icon}
          {title}
        </h2>
        <div className="flex items-center gap-2">
          <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', badgeColors[variant])}>
            {count}
          </span>
          {to && (
            <Link
              to={to}
              className="text-xs font-medium text-muted hover:text-ink inline-flex items-center gap-1"
            >
              Shiko
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      {hasContent ? (
        <div className="space-y-2">{children}</div>
      ) : (
        <p className="text-sm text-muted">{empty}</p>
      )}
    </div>
  )
}

function AlertRow({
  title,
  subtitle,
  badge,
  to,
}: {
  title: string
  subtitle: string
  badge?: string
  to?: string | null
}) {
  const content = (
    <div className="flex items-start gap-3 rounded-lg bg-white/60 p-3 transition-colors hover:bg-white">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink truncate">{title}</p>
        <p className="mt-0.5 text-xs text-muted line-clamp-2">{subtitle}</p>
      </div>
      {badge && (
        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700">
          {badge}
        </span>
      )}
    </div>
  )

  if (to) {
    return <Link to={to}>{content}</Link>
  }
  return content
}
