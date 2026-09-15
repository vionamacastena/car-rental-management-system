export interface DashboardReport {
  revenue: {
    total_revenue: number
    rental_revenue: number
    deposits_received: number
    extra_charges: number
    total_refunded: number
    net_received: number
  }
  fleet: {
    total_vehicles: number
    available_now: number
    rented_now: number
    in_maintenance_now: number
    rented_days: number
    available_rental_days: number
    utilization_rate: number
    downtime_days: number
  }
  rentals: {
    total_reservations: number
    completed_reservations: number
    cancelled_reservations: number
    no_show_reservations: number
    overdue_rentals: number
    cancellation_rate: number
    no_show_rate: number
    total_rentals: number
    average_duration_days: number
    average_value: number
  }
  customers: {
    total_customers: number
    new_customers: number
    returning_customers: number
    avg_revenue_per_customer: number
  }
  financial: {
    maintenance_cost: number
    damage_cost: number
    outstanding_payments: number
  }
}

export interface ReportRange {
  from: string
  to: string
}

export interface DashboardResponse {
  data: DashboardReport
  range: ReportRange
}

export interface RevenueDataPoint {
  period: string
  revenue: number
  payment_count: number
}

export interface VehiclePerformance {
  vehicle_id: number
  full_name: string
  license_plate: string
  status: { value: string; label: string }
  rentals_count: number
  rented_days: number
  revenue: number
  utilization_rate: number
}

export interface LocationPerformance {
  location_id: number
  name: string
  city: string
  reservations_count: number
  revenue: number
}

export type RevenueGroupBy = 'day' | 'week' | 'month'
