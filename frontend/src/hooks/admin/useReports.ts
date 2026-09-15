import { useQuery } from '@tanstack/react-query'
import {
  fetchDashboardReport,
  fetchRevenueChart,
  fetchVehiclePerformance,
  fetchLocationPerformance,
  type ReportFilters,
} from '@/services/admin/reports'
import type { RevenueGroupBy } from '@/types/report'

const KEY = ['admin', 'reports']

export function useDashboardReport(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: [...KEY, 'dashboard', filters],
    queryFn: () => fetchDashboardReport(filters),
  })
}

export function useRevenueChart(filters: ReportFilters & { group_by?: RevenueGroupBy }) {
  return useQuery({
    queryKey: [...KEY, 'revenue', filters],
    queryFn: () => fetchRevenueChart(filters),
  })
}

export function useVehiclePerformance(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: [...KEY, 'vehicles', filters],
    queryFn: () => fetchVehiclePerformance(filters),
  })
}

export function useLocationPerformance(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: [...KEY, 'locations', filters],
    queryFn: () => fetchLocationPerformance(filters),
  })
}
