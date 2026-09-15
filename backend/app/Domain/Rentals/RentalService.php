<?php

namespace App\Domain\Rentals;

use App\Enums\RentalStatus;
use App\Enums\ReservationStatus;
use App\Enums\VehicleStatus;
use App\Models\Rental;
use App\Models\Reservation;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use App\Domain\Payments\PaymentService;

class RentalService
{
    public function __construct(
    private readonly ChargeCalculator $charges,
    private readonly \App\Domain\Payments\PaymentService $payments,
) {}

    public function createFromReservation(Reservation $reservation): Rental
    {
        return DB::transaction(function () use ($reservation) {
            $existing = Rental::where('reservation_id', $reservation->id)->first();
            if ($existing) {
                return $existing;
            }

            if ($reservation->status !== ReservationStatus::RESERVED) {
                throw new RuntimeException(
                    "Vetëm rezervimet 'Reserved' mund të konvertohen në rental. Statusi: {$reservation->status->label()}."
                );
            }

            return Rental::create([
                'rental_code' => (new Rental)->generateCode(),
                'reservation_id' => $reservation->id,
                'customer_id' => $reservation->customer_id,
                'vehicle_id' => $reservation->vehicle_id,
                'pickup_location_id' => $reservation->pickup_location_id,
                'return_location_id' => $reservation->return_location_id,
                'planned_pickup_at' => $reservation->pickup_at,
                'planned_return_at' => $reservation->return_at,
                'status' => RentalStatus::PENDING_CHECKOUT,
                'base_amount' => $reservation->subtotal,
                'extras_amount' => $reservation->extras_total,
                'fees_amount' => $reservation->fees_total,
                'taxes_amount' => $reservation->taxes_total,
                'discount_amount' => $reservation->discount_total,
                'total_amount' => $reservation->total,
                'deposit_amount' => $reservation->deposit_amount,
            ]);
        });
    }

    public function checkout(Rental $rental, array $data): Rental
    {
        return DB::transaction(function () use ($rental, $data) {
            $vehicle = $rental->vehicle()->lockForUpdate()->first();

            if ($rental->status !== RentalStatus::PENDING_CHECKOUT) {
                throw new RuntimeException(
                    "Check-out vetëm për rentals 'Pending Check-out'. Statusi: {$rental->status->label()}."
                );
            }

            $rental->update([
                'status' => RentalStatus::ACTIVE,
                'actual_pickup_at' => now(),
                'checked_out_at' => now(),
                'pickup_mileage' => $data['pickup_mileage'],
                'pickup_fuel_level' => $data['pickup_fuel_level'],
                'checkout_condition' => $data['checkout_condition'] ?? null,
                'checkout_notes' => $data['checkout_notes'] ?? null,
                'checkout_signature' => $data['checkout_signature'] ?? null,
            ]);

            $vehicle->update([
                'status' => VehicleStatus::RENTED,
                'mileage' => max((int) $vehicle->mileage, (int) $data['pickup_mileage']),
            ]);

            if ($rental->reservation) {
                $rental->reservation->update(['status' => ReservationStatus::PICKED_UP]);
            }

            return $rental->fresh(['customer', 'vehicle', 'reservation', 'pickupLocation', 'returnLocation']);
        });
    }

    /**
     * Regjistron check-in (kthimin e automjetit).
     * - Rental → COMPLETED
     * - Vehicle → CLEANING (pa dëm) ose DAMAGED (me dëm)
     * - Reservation → COMPLETED
     * - Kalkulohen charges + deposit settlement
     */
    public function checkin(Rental $rental, array $data): Rental
    {
        return DB::transaction(function () use ($rental, $data) {
            $vehicle = $rental->vehicle()->lockForUpdate()->first();

            if (! in_array($rental->status, [RentalStatus::ACTIVE, RentalStatus::PENDING_CHECKIN], true)) {
                throw new RuntimeException(
                    "Check-in vetëm për rentals active. Statusi: {$rental->status->label()}."
                );
            }

            // 1. Kalkulo charges
            $charges = $this->charges->calculateAdditionalCharges($rental, $data);
            $settlement = $this->charges->calculateDepositSettlement($rental, $charges);

            // Nëse admin ka dhënë override manual, përdori ato
            if (isset($data['deposit_deduction'])) {
                $settlement['deposit_deduction'] = (float) $data['deposit_deduction'];
            }
            if (isset($data['deposit_refund'])) {
                $settlement['deposit_refund'] = (float) $data['deposit_refund'];
            }

            // 2. A ka dëm të re?
            $newDamages = $data['checkin_condition']['new_damages'] ?? [];
            $hasNewDamage = ! empty($newDamages) || ($charges['damage_amount'] > 0);

            // 3. Update rental
            $rental->update([
                'status' => RentalStatus::COMPLETED,
                'actual_return_at' => now(),
                'checked_in_at' => now(),
                'return_mileage' => $data['return_mileage'],
                'return_fuel_level' => $data['return_fuel_level'],
                'mileage_used' => $charges['mileage_used'],
                'checkin_condition' => $data['checkin_condition'] ?? null,
                'checkin_notes' => $data['checkin_notes'] ?? null,
                'checkin_signature' => $data['checkin_signature'] ?? null,
                'fuel_amount' => $charges['fuel_amount'],
                'damage_amount' => $charges['damage_amount'],
                'extra_mileage_amount' => $charges['extra_mileage_amount'],
                'late_return_amount' => $charges['late_return_amount'],
                'other_charges_amount' => $charges['other_charges_amount'],
                'total_amount' => $charges['total_amount'],
                'deposit_deduction' => $settlement['deposit_deduction'],
                'deposit_refund' => $settlement['deposit_refund'],
            ]);

            // 4. Update vehicle
            $vehicle->update([
                'status' => $hasNewDamage ? VehicleStatus::DAMAGED : VehicleStatus::CLEANING,
                'mileage' => max((int) $vehicle->mileage, (int) $data['return_mileage']),
            ]);

            // 5. Update reservation
            if ($rental->reservation) {
                $rental->reservation->update(['status' => ReservationStatus::COMPLETED]);
            }
            // 6. Auto-krijo payment records për deposit settlement
$shouldCreatePayments = $data['create_payments'] ?? true;
if ($shouldCreatePayments && $rental->deposit_amount > 0) {
    $this->payments->settleDeposit(
        $rental,
        (float) $settlement['deposit_deduction'],
        (float) $settlement['deposit_refund'],
        $data['refund_method'] ?? null,
        auth()->id(),
    );
}

            return $rental->fresh(['customer', 'vehicle', 'reservation', 'pickupLocation', 'returnLocation']);
        });
    }

    public function cancel(Rental $rental): Rental
    {
        return DB::transaction(function () use ($rental) {
            if ($rental->status !== RentalStatus::PENDING_CHECKOUT) {
                throw new RuntimeException(
                    "Vetëm rentals 'Pending Check-out' mund të anulohen."
                );
            }

            $rental->update(['status' => RentalStatus::CANCELLED]);

            return $rental->fresh();
        });
    }
}
