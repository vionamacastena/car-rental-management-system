import { api } from '@/services/api'
import type {
  DashboardResponse,
  LocationPerformance,
  RevenueDataPoint,
  RevenueGroupBy,
  VehiclePerformance,
} from '@/types/report'

export interface ReportFilters {
  from?: string
  to?: string
}

function buildParams(f: ReportFilters) {
  const params: Record<string, string | undefined> = {}
  if (f.from) params.from = f.from
  if (f.to) params.to = f.to
  return params
}

export async function fetchDashboardReport(f: ReportFilters = {}): Promise<DashboardResponse> {
  const { data } = await api.get<DashboardResponse>('/admin/reports/dashboard', {
    params: buildParams(f),
  })
  return data
}

export async function fetchRevenueChart(
  f: ReportFilters & { group_by?: RevenueGroupBy },
): Promise<RevenueDataPoint[]> {
  const { data } = await api.get<{ data: RevenueDataPoint[]; group_by: string }>(
    '/admin/reports/revenue',
    { params: { ...buildParams(f), group_by: f.group_by ?? 'day' } },
  )
  return data.data
}

export async function fetchVehiclePerformance(f: ReportFilters = {}): Promise<VehiclePerformance[]> {
  const { data } = await api.get<{ data: VehiclePerformance[] }>('/admin/reports/vehicles', {
    params: buildParams(f),
  })
  return data.data
}

export async function fetchLocationPerformance(f: ReportFilters = {}): Promise<LocationPerformance[]> {
  const { data } = await api.get<{ data: LocationPerformance[] }>('/admin/reports/locations', {
    params: buildParams(f),
  })
  return data.data
}
