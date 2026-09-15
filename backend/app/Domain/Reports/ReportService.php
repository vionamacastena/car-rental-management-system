<?php

namespace App\Domain\Reports;

use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Enums\RentalStatus;
use App\Enums\ReservationStatus;
use App\Enums\VehicleStatus;
use App\Models\MaintenanceRecord;
use App\Models\Payment;
use App\Models\Rental;
use App\Models\Reservation;
use App\Models\Vehicle;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;

class ReportService
{
    /**
     * KPI-t kryesore të dashboard-it.
     */
    public function dashboard(CarbonInterface $from, CarbonInterface $to): array
    {
        return [
            'revenue' => $this->revenueMetrics($from, $to),
            'fleet' => $this->fleetMetrics($from, $to),
            'rentals' => $this->rentalMetrics($from, $to),
            'customers' => $this->customerMetrics($from, $to),
            'financial' => $this->financialMetrics($from, $to),
        ];
    }

    /**
     * Total revenue, deposits, refunds, outstanding.
     */
    public function revenueMetrics(CarbonInterface $from, CarbonInterface $to): array
    {
        $payments = Payment::query()
            ->where('status', PaymentStatus::COMPLETED)
            ->whereBetween('paid_at', [$from, $to])
            ->get();

        $totalIncoming = $payments
            ->filter(fn (Payment $p) => $p->type->isIncoming())
            ->sum(fn (Payment $p) => (float) $p->amount - (float) $p->refunded_amount);

        $totalRefunded = $payments
            ->filter(fn (Payment $p) => $p->type->isOutgoing())
            ->sum(fn (Payment $p) => (float) $p->amount);

        $rentalRevenue = $payments
            ->filter(fn (Payment $p) => $p->type === PaymentType::RENTAL_PAYMENT)
            ->sum(fn (Payment $p) => (float) $p->amount - (float) $p->refunded_amount);

        $depositsReceived = $payments
            ->filter(fn (Payment $p) => $p->type === PaymentType::DEPOSIT_RECEIVED)
            ->sum(fn (Payment $p) => (float) $p->amount);

        $extraCharges = $payments
            ->filter(fn (Payment $p) => $p->type === PaymentType::EXTRA_CHARGE)
            ->sum(fn (Payment $p) => (float) $p->amount);

        return [
            'total_revenue' => round((float) $totalIncoming - (float) $totalRefunded, 2),
            'rental_revenue' => round((float) $rentalRevenue, 2),
            'deposits_received' => round((float) $depositsReceived, 2),
            'extra_charges' => round((float) $extraCharges, 2),
            'total_refunded' => round((float) $totalRefunded, 2),
            'net_received' => round((float) $totalIncoming - (float) $totalRefunded, 2),
        ];
    }

    /**
     * Fleet utilization, revenue per vehicle, downtime.
     */
    public function fleetMetrics(CarbonInterface $from, CarbonInterface $to): array
    {
        $totalVehicles = Vehicle::count();
        $availableVehicles = Vehicle::where('status', VehicleStatus::AVAILABLE)->count();
        $rentedVehicles = Vehicle::where('status', VehicleStatus::RENTED)->count();
        $maintenanceVehicles = Vehicle::whereIn('status', [
            VehicleStatus::MAINTENANCE,
            VehicleStatus::CLEANING,
            VehicleStatus::DAMAGED,
        ])->count();

        $totalDays = $from->diffInDays($to) + 1;

        // Rented days = shuma e ditëve aktuale të rental-eve brenda intervalit
        $rentals = Rental::query()
            ->whereIn('status', [
                RentalStatus::PENDING_CHECKOUT->value,
                RentalStatus::ACTIVE->value,
                RentalStatus::PENDING_CHECKIN->value,
                RentalStatus::COMPLETED->value,
            ])
            ->where('planned_pickup_at', '<=', $to)
            ->where('planned_return_at', '>=', $from)
            ->get();

        $rentedDays = 0;
        foreach ($rentals as $rental) {
            $start = $rental->planned_pickup_at->max($from);
            $end = $rental->planned_return_at->min($to);
            $rentedDays += max(0, $start->diffInDays($end));
        }

        $availableRentalDays = $totalVehicles * $totalDays;
        $utilization = $availableRentalDays > 0
            ? round(($rentedDays / $availableRentalDays) * 100, 2)
            : 0;

        return [
            'total_vehicles' => $totalVehicles,
            'available_now' => $availableVehicles,
            'rented_now' => $rentedVehicles,
            'in_maintenance_now' => $maintenanceVehicles,
            'rented_days' => $rentedDays,
            'available_rental_days' => $availableRentalDays,
            'utilization_rate' => $utilization,
            'downtime_days' => max(0, $availableRentalDays - $rentedDays),
        ];
    }

    /**
     * Rental metrics: total, average duration, average value, cancellation rate.
     */
    public function rentalMetrics(CarbonInterface $from, CarbonInterface $to): array
    {
        $baseQuery = Reservation::query()->whereBetween('created_at', [$from, $to]);

        $total = (clone $baseQuery)->count();
        $cancelled = (clone $baseQuery)->where('status', ReservationStatus::CANCELLED)->count();
        $noShow = (clone $baseQuery)->where('status', ReservationStatus::NO_SHOW)->count();
        $completed = (clone $baseQuery)->where('status', ReservationStatus::COMPLETED)->count();
        $overdue = Rental::where('status', RentalStatus::ACTIVE)
            ->where('planned_return_at', '<', now())
            ->count();

        $rentals = Rental::query()
            ->whereBetween('created_at', [$from, $to])
            ->whereIn('status', [
                RentalStatus::ACTIVE->value,
                RentalStatus::PENDING_CHECKIN->value,
                RentalStatus::COMPLETED->value,
            ])
            ->get();

        $avgDuration = $rentals->avg(fn (Rental $r) => 
            $r->planned_pickup_at->diffInDays($r->planned_return_at)
        ) ?? 0;

        $avgValue = $rentals->avg(fn (Rental $r) => (float) $r->total_amount) ?? 0;

        return [
            'total_reservations' => $total,
            'completed_reservations' => $completed,
            'cancelled_reservations' => $cancelled,
            'no_show_reservations' => $noShow,
            'overdue_rentals' => $overdue,
            'cancellation_rate' => $total > 0 ? round(($cancelled / $total) * 100, 2) : 0,
            'no_show_rate' => $total > 0 ? round(($noShow / $total) * 100, 2) : 0,
            'total_rentals' => $rentals->count(),
            'average_duration_days' => round((float) $avgDuration, 2),
            'average_value' => round((float) $avgValue, 2),
        ];
    }

    /**
     * Customer metrics: new, returning, revenue per customer.
     */
    public function customerMetrics(CarbonInterface $from, CarbonInterface $to): array
    {
        // Klientë të re (regjistruar në interval)
        $newCustomers = \App\Models\Customer::whereBetween('created_at', [$from, $to])->count();

        // Klientë returning (me > 1 rental në interval)
        $returningCustomers = Rental::query()
            ->whereBetween('created_at', [$from, $to])
            ->select('customer_id')
            ->groupBy('customer_id')
            ->havingRaw('COUNT(*) > 1')
            ->get()
            ->count();

        $totalCustomers = \App\Models\Customer::count();

        $avgRevenuePerCustomer = $totalCustomers > 0
            ? round((float) Payment::where('status', PaymentStatus::COMPLETED)
                ->whereBetween('paid_at', [$from, $to])
                ->sum('amount') / $totalCustomers, 2)
            : 0;

        return [
            'total_customers' => $totalCustomers,
            'new_customers' => $newCustomers,
            'returning_customers' => $returningCustomers,
            'avg_revenue_per_customer' => $avgRevenuePerCustomer,
        ];
    }

    /**
     * Financial metrics: maintenance cost, damage cost, outstanding payments.
     */
    public function financialMetrics(CarbonInterface $from, CarbonInterface $to): array
    {
        $maintenanceCost = MaintenanceRecord::whereBetween('performed_at', [$from, $to])
            ->where('status', 'completed')
            ->sum('cost');

        $damageCost = Rental::whereBetween('actual_return_at', [$from, $to])
            ->sum('damage_amount');

        $outstanding = Payment::where('status', PaymentStatus::PENDING)->sum('amount');

        return [
            'maintenance_cost' => round((float) $maintenanceCost, 2),
            'damage_cost' => round((float) $damageCost, 2),
            'outstanding_payments' => round((float) $outstanding, 2),
        ];
    }

    /**
     * Revenue chart — grouped by day/week/month.
     */
    public function revenueChart(
        CarbonInterface $from,
        CarbonInterface $to,
        string $groupBy = 'day',
    ): array {
        // Group key SQL varet nga DB
        $driver = DB::connection()->getDriverName();
        $dateExpr = match ($groupBy) {
            'week' => $driver === 'pgsql'
                ? "to_char(paid_at, 'IYYY-IW')"
                : "strftime('%Y-%W', paid_at)",
            'month' => $driver === 'pgsql'
                ? "to_char(paid_at, 'YYYY-MM')"
                : "strftime('%Y-%m', paid_at)",
            default => $driver === 'pgsql'
                ? "to_char(paid_at, 'YYYY-MM-DD')"
                : "strftime('%Y-%m-%d', paid_at)",
        };

        $rows = Payment::query()
            ->where('status', PaymentStatus::COMPLETED)
            ->whereBetween('paid_at', [$from, $to])
            ->whereIn('type', ['rental_payment', 'extra_charge'])
            ->selectRaw("{$dateExpr} as period")
            ->selectRaw('SUM(amount - refunded_amount) as revenue')
            ->selectRaw('COUNT(*) as payment_count')
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        return $rows->map(fn ($r) => [
            'period' => $r->period,
            'revenue' => round((float) $r->revenue, 2),
            'payment_count' => (int) $r->payment_count,
        ])->all();
    }

    /**
     * Performance per vehicle.
     */
    public function vehiclePerformance(CarbonInterface $from, CarbonInterface $to): array
    {
        $vehicles = Vehicle::query()->get();
        $totalDays = $from->diffInDays($to) + 1;

        return $vehicles->map(function (Vehicle $v) use ($from, $to, $totalDays) {
            $rentals = Rental::where('vehicle_id', $v->id)
                ->whereBetween('created_at', [$from, $to])
                ->whereIn('status', [
                    RentalStatus::ACTIVE->value,
                    RentalStatus::PENDING_CHECKIN->value,
                    RentalStatus::COMPLETED->value,
                ])
                ->get();

            $rentedDays = $rentals->sum(fn (Rental $r) => 
                $r->planned_pickup_at->diffInDays($r->planned_return_at)
            );

            $revenue = $rentals->sum(fn (Rental $r) => (float) $r->total_amount);
            $utilization = $totalDays > 0
                ? round(($rentedDays / $totalDays) * 100, 2)
                : 0;

            return [
                'vehicle_id' => $v->id,
                'full_name' => $v->fullName(),
                'license_plate' => $v->license_plate,
                'status' => [
                    'value' => $v->status->value,
                    'label' => $v->status->label(),
                ],
                'rentals_count' => $rentals->count(),
                'rented_days' => $rentedDays,
                'revenue' => round((float) $revenue, 2),
                'utilization_rate' => $utilization,
            ];
        })
        ->sortByDesc('revenue')
        ->values()
        ->all();
    }

    /**
     * Performance per location.
     */
    public function locationPerformance(CarbonInterface $from, CarbonInterface $to): array
    {
        $locations = \App\Models\Location::query()->where('is_active', true)->get();

        return $locations->map(function ($loc) use ($from, $to) {
            $reservations = Reservation::where('pickup_location_id', $loc->id)
                ->whereBetween('created_at', [$from, $to])
                ->count();

            $revenue = Reservation::where('pickup_location_id', $loc->id)
                ->whereBetween('created_at', [$from, $to])
                ->sum('total');

            return [
                'location_id' => $loc->id,
                'name' => $loc->name,
                'city' => $loc->city,
                'reservations_count' => $reservations,
                'revenue' => round((float) $revenue, 2),
            ];
        })
        ->sortByDesc('revenue')
        ->values()
        ->all();
    }
}
