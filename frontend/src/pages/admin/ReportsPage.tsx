import { useMemo, useState } from 'react'
import {
  DollarSign, Car, CalendarCheck, Users, TrendingUp, TrendingDown,
  Activity, Clock, AlertCircle, Wrench, Wallet, BarChart3,
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { KPICard } from '@/components/admin/KPICard'
import { DateRangePicker, type DateRange } from '@/components/admin/DateRangePicker'
import {
  useDashboardReport,
  useRevenueChart,
  useVehiclePerformance,
  useLocationPerformance,
} from '@/hooks/admin/useReports'
import { cn } from '@/lib/cn'
import type { RevenueGroupBy } from '@/types/report'

const COLORS = ['#D4A24C', '#0F1417', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6']

function defaultRange(): DateRange {
  const to = new Date()
  const from = new Date()
  from.setDate(to.getDate() - 29)
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  }
}

export default function ReportsPage() {
  const [range, setRange] = useState<DateRange>(defaultRange())
  const [groupBy, setGroupBy] = useState<RevenueGroupBy>('day')

  const { data: dashboard, isLoading: loadingDashboard } = useDashboardReport(range)
  const { data: revenue, isLoading: loadingRevenue } = useRevenueChart({ ...range, group_by: groupBy })
  const { data: vehicles, isLoading: loadingVehicles } = useVehiclePerformance(range)
  const { data: locations, isLoading: loadingLocations } = useLocationPerformance(range)

  const report = dashboard?.data

  // Përgatit data për chart
  const revenueChartData = useMemo(
    () => (revenue ?? []).map((p) => ({
      period: formatPeriod(p.period, groupBy),
      revenue: p.revenue,
      payments: p.payment_count,
    })),
    [revenue, groupBy],
  )

  // Pie data: revenue distribution
  const pieData = useMemo(() => {
    if (!report) return []
    return [
      { name: 'Qiraja', value: report.revenue.rental_revenue },
      { name: 'Depozita', value: report.revenue.deposits_received },
      { name: 'Tarifa shtesë', value: report.revenue.extra_charges },
    ].filter((d) => d.value > 0)
  }, [report])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Raporte & Analytics</h1>
          <p className="mt-2 text-muted">
            Përmbledhje e performancës për periudhën e zgjedhur.
          </p>
        </div>
      </div>

      {/* Date range */}
      <DateRangePicker value={range} onChange={setRange} />

      {/* KPI cards — Rreshti 1: Revenue */}
      {loadingDashboard && <KPISkeleton />}
      {report && (
        <>
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
              Financa
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                icon={<DollarSign className="h-5 w-5" />}
                label="Të hyra totale"
                value={`${report.revenue.total_revenue.toFixed(2)}€`}
                hint={`Neto: ${report.revenue.net_received.toFixed(2)}€`}
                color="emerald"
              />
              <KPICard
                icon={<TrendingUp className="h-5 w-5" />}
                label="Të hyra qiraje"
                value={`${report.revenue.rental_revenue.toFixed(2)}€`}
                color="blue"
              />
              <KPICard
                icon={<Wallet className="h-5 w-5" />}
                label="Depozita"
                value={`${report.revenue.deposits_received.toFixed(2)}€`}
                color="purple"
              />
              <KPICard
                icon={<TrendingDown className="h-5 w-5" />}
                label="Rimbursime"
                value={`${report.revenue.total_refunded.toFixed(2)}€`}
                color="red"
              />
            </div>
          </section>

          {/* KPI cards — Rreshti 2: Fleet */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
              Flota
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                icon={<Car className="h-5 w-5" />}
                label="Automjete gjithsej"
                value={String(report.fleet.total_vehicles)}
                hint={`${report.fleet.available_now} aktive`}
                color="ink"
              />
              <KPICard
                icon={<Activity className="h-5 w-5" />}
                label="Utilizimi"
                value={`${report.fleet.utilization_rate}%`}
                hint={`${report.fleet.rented_days} ditë me qira`}
                color={report.fleet.utilization_rate > 60 ? 'emerald' : report.fleet.utilization_rate > 30 ? 'amber' : 'red'}
              />
              <KPICard
                icon={<Clock className="h-5 w-5" />}
                label="Kohë joproduktive"
                value={`${Math.round(report.fleet.downtime_days)} ditë`}
                color="amber"
              />
              <KPICard
                icon={<AlertCircle className="h-5 w-5" />}
                label="Në maintenance"
                value={String(report.fleet.in_maintenance_now)}
                color="red"
              />
            </div>
          </section>

          {/* KPI cards — Rreshti 3: Rentals & Customers */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
              Operacionet
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                icon={<CalendarCheck className="h-5 w-5" />}
                label="Rezervime gjithsej"
                value={String(report.rentals.total_reservations)}
                hint={`${report.rentals.completed_reservations} përfunduar`}
                color="blue"
              />
              <KPICard
                icon={<Clock className="h-5 w-5" />}
                label="Kohëzgjatja mesatare"
                value={`${report.rentals.average_duration_days} ditë`}
                color="purple"
              />
              <KPICard
                icon={<Users className="h-5 w-5" />}
                label="Klientë"
                value={String(report.customers.total_customers)}
                hint={`${report.customers.new_customers} të re`}
                color="ink"
              />
              <KPICard
                icon={<DollarSign className="h-5 w-5" />}
                label="Mesatar / klient"
                value={`${report.customers.avg_revenue_per_customer.toFixed(2)}€`}
                color="emerald"
              />
            </div>
          </section>

          {/* Charts row */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue chart */}
            <div className="lg:col-span-2 rounded-2xl border border-line bg-white p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-display text-lg font-bold text-ink">
                  Të hyrat përgjatë kohës
                </h3>
                <div className="flex gap-1">
                  {(['day', 'week', 'month'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGroupBy(g)}
                      className={cn(
                        'rounded-lg px-3 py-1 text-xs font-medium transition-colors',
                        groupBy === g ? 'bg-ink text-cream' : 'text-muted hover:bg-ink/5 hover:text-ink',
                      )}
                    >
                      {g === 'day' ? 'Ditë' : g === 'week' ? 'Javë' : 'Muaj'}
                    </button>
                  ))}
                </div>
              </div>

              {loadingRevenue ? (
                <div className="h-72 animate-pulse rounded-lg bg-line/40" />
              ) : revenueChartData.length === 0 ? (
                <div className="flex h-72 flex-col items-center justify-center text-center">
                  <BarChart3 className="h-10 w-10 text-muted" />
                  <p className="mt-3 text-sm text-muted">Nuk ka të dhëna për këtë periudhë.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E1D8" />
                    <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#8A8A8A' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#8A8A8A' }} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid #E5E1D8', fontSize: 12 }}
                      formatter={(value: number) => [`${value.toFixed(2)}€`, 'Të hyra']}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#D4A24C"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#D4A24C' }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Pie chart */}
            <div className="rounded-2xl border border-line bg-white p-6">
              <h3 className="mb-5 font-display text-lg font-bold text-ink">
                Ndarja e të hyrave
              </h3>
              {pieData.length === 0 ? (
                <div className="flex h-72 items-center justify-center">
                  <p className="text-sm text-muted">Nuk ka të dhëna.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid #E5E1D8', fontSize: 12 }}
                      formatter={(value: number) => `${value.toFixed(2)}€`}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          {/* Financial bottom row */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KPICard
              icon={<Wrench className="h-5 w-5" />}
              label="Kosto maintenance"
              value={`${report.financial.maintenance_cost.toFixed(2)}€`}
              color="amber"
            />
            <KPICard
              icon={<AlertCircle className="h-5 w-5" />}
              label="Kosto dëmesh"
              value={`${report.financial.damage_cost.toFixed(2)}€`}
              color="red"
            />
            <KPICard
              icon={<Wallet className="h-5 w-5" />}
              label="Pagesa të papaguara"
              value={`${report.financial.outstanding_payments.toFixed(2)}€`}
              color="ink"
            />
          </section>

          {/* Vehicle performance table */}
          <section className="rounded-2xl border border-line bg-white">
            <div className="border-b border-line px-6 py-4">
              <h3 className="font-display text-lg font-bold text-ink">
                Performanca per automjet
              </h3>
              <p className="mt-0.5 text-xs text-muted">
                Renditur sipas të hyrave (desc)
              </p>
            </div>

            {loadingVehicles ? (
              <div className="p-6">
                <div className="h-40 animate-pulse rounded-lg bg-line/40" />
              </div>
            ) : (vehicles ?? []).length === 0 ? (
              <div className="p-12 text-center text-sm text-muted">Nuk ka të dhëna.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-line bg-cream/50">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      <th className="px-6 py-3">Automjeti</th>
                      <th className="px-6 py-3">Targa</th>
                      <th className="px-6 py-3 text-center">Rentals</th>
                      <th className="px-6 py-3 text-center">Ditë qira</th>
                      <th className="px-6 py-3 text-center">Utilizimi</th>
                      <th className="px-6 py-3 text-right">Të hyra</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {(vehicles ?? []).map((v) => (
                      <tr key={v.vehicle_id} className="text-sm">
                        <td className="px-6 py-3.5 font-medium text-ink">{v.full_name}</td>
                        <td className="px-6 py-3.5 font-mono text-xs text-muted">{v.license_plate}</td>
                        <td className="px-6 py-3.5 text-center text-ink">{v.rentals_count}</td>
                        <td className="px-6 py-3.5 text-center text-ink">{v.rented_days}</td>
                        <td className="px-6 py-3.5 text-center">
                          <UtilizationBar value={v.utilization_rate} />
                        </td>
                        <td className="px-6 py-3.5 text-right font-medium text-ink">
                          {v.revenue.toFixed(2)}€
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Location performance table */}
          <section className="rounded-2xl border border-line bg-white">
            <div className="border-b border-line px-6 py-4">
              <h3 className="font-display text-lg font-bold text-ink">
                Performanca per lokacion
              </h3>
            </div>

            {loadingLocations ? (
              <div className="p-6">
                <div className="h-40 animate-pulse rounded-lg bg-line/40" />
              </div>
            ) : (locations ?? []).length === 0 ? (
              <div className="p-12 text-center text-sm text-muted">Nuk ka të dhëna.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-line bg-cream/50">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      <th className="px-6 py-3">Lokacioni</th>
                      <th className="px-6 py-3">Qyteti</th>
                      <th className="px-6 py-3 text-center">Rezervime</th>
                      <th className="px-6 py-3 text-right">Të hyra</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {(locations ?? []).map((l) => (
                      <tr key={l.location_id} className="text-sm">
                        <td className="px-6 py-3.5 font-medium text-ink">{l.name}</td>
                        <td className="px-6 py-3.5 text-muted">{l.city}</td>
                        <td className="px-6 py-3.5 text-center text-ink">{l.reservations_count}</td>
                        <td className="px-6 py-3.5 text-right font-medium text-ink">
                          {l.revenue.toFixed(2)}€
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function KPISkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, j) => (
            <div key={j} className="h-32 animate-pulse rounded-2xl bg-line/40" />
          ))}
        </div>
      ))}
    </div>
  )
}

function UtilizationBar({ value }: { value: number }) {
  const color =
    value >= 60 ? 'bg-emerald-500' :
    value >= 30 ? 'bg-amber-500' :
    'bg-red-500'

  return (
    <div className="flex items-center justify-center gap-2">
      <div className="h-2 w-20 overflow-hidden rounded-full bg-line">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <span className="text-xs font-medium text-ink tabular-nums">{value}%</span>
    </div>
  )
}

function formatPeriod(period: string, groupBy: RevenueGroupBy): string {
  if (groupBy === 'month') {
    const [y, m] = period.split('-')
    return `${m}/${y}`
  }
  if (groupBy === 'week') {
    return `J${period.split('-')[1]}`
  }
  const [y, m, d] = period.split('-')
  return `${d}/${m}`
}
