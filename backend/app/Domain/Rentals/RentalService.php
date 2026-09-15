<?php

namespace App\Domain\Rentals;

use App\Enums\RentalStatus;
use App\Enums\ReservationStatus;
use App\Enums\VehicleStatus;
use App\Models\Rental;
use App\Models\Reservation;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class RentalService
{
    /**
     * Konverton një rezervim në rental (PENDING_CHECKOUT).
     */
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

    /**
     * Regjistron check-out (dorëzimin e automjetit).
     * - Rental → ACTIVE
     * - Vehicle → RENTED (mileage përditësohet)
     * - Reservation → PICKED_UP
     */
    public function checkout(Rental $rental, array $data): Rental
    {
        return DB::transaction(function () use ($rental, $data) {
            // Lock vehicle për të shmangur race me rezervime të tjera
            $vehicle = $rental->vehicle()->lockForUpdate()->first();

            if ($rental->status !== RentalStatus::PENDING_CHECKOUT) {
                throw new RuntimeException(
                    "Check-out vetëm për rentals 'Pending Check-out'. Statusi: {$rental->status->label()}."
                );
            }

            // Update rental
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

            // Vehicle → RENTED, update mileage
            $vehicle->update([
                'status' => VehicleStatus::RENTED,
                'mileage' => max((int) $vehicle->mileage, (int) $data['pickup_mileage']),
            ]);

            // Reservation → PICKED_UP
            if ($rental->reservation) {
                $rental->reservation->update([
                    'status' => ReservationStatus::PICKED_UP,
                ]);
            }

            return $rental->fresh(['customer', 'vehicle', 'reservation', 'pickupLocation', 'returnLocation']);
        });
    }

    /**
     * Anulon një rental vetëm nëse është ende PENDING_CHECKOUT.
     */
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
