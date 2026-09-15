<?php

namespace App\Domain\Availability;

use App\Enums\VehicleStatus;
use App\Models\Vehicle;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AvailabilityEngine
{
    /**
     * Kontrollon nëse një vehicle është i disponueshëm për intervalin [start, end).
     *
     * @param  int  $vehicleId
     * @param  CarbonInterface  $start
     * @param  CarbonInterface  $end
     * @param  int|null  $excludeReservationId  Përjashto një rezervim (edit mode)
     */
    public function isVehicleAvailable(
        int $vehicleId,
        CarbonInterface $start,
        CarbonInterface $end,
        ?int $excludeReservationId = null,
    ): bool {
        return ! $this->hasOverlappingReservation($vehicleId, $start, $end, $excludeReservationId);
    }

    /**
     * Kontrollon overlap ekzistues.
     * Logjika: intervalet [start, end) mbivendosen nëse A.start < B.end AND A.end > B.start.
     */
    public function hasOverlappingReservation(
        int $vehicleId,
        CarbonInterface $start,
        CarbonInterface $end,
        ?int $excludeReservationId = null,
    ): bool {
        return DB::table('reservations')
            ->where('vehicle_id', $vehicleId)
            ->whereIn('status', ['reserved', 'picked_up', 'active', 'overdue'])
            ->where('pickup_at', '<', $end)
            ->where('return_at', '>', $start)
            ->when($excludeReservationId, fn ($q) => $q->where('id', '!=', $excludeReservationId))
            ->exists();
    }

    /**
     * Gjej të gjitha vehicle-t e disponueshme për intervalin.
     *
     * @return Collection<int, Vehicle>
     */
    public function findAvailableVehicles(
        CarbonInterface $start,
        CarbonInterface $end,
        array $filters = [],
    ): Collection {
        // Subquery: vehicle IDs që KANË rezervim që bllokon
        $blockedIds = DB::table('reservations')
            ->select('vehicle_id')
            ->whereIn('status', ['reserved', 'picked_up', 'active', 'overdue'])
            ->where('pickup_at', '<', $end)
            ->where('return_at', '>', $start)
            ->pluck('vehicle_id')
            ->unique()
            ->values()
            ->all();

        $query = Vehicle::query()
            ->where('status', VehicleStatus::AVAILABLE->value)
            ->whereNotIn('id', $blockedIds);

        if (! empty($filters['location_id'])) {
            $query->where('current_location_id', $filters['location_id']);
        }

        if (! empty($filters['fuel_type'])) {
            $query->where('fuel_type', $filters['fuel_type']);
        }

        if (! empty($filters['transmission'])) {
            $query->where('transmission', $filters['transmission']);
        }

        if (! empty($filters['seats'])) {
            $query->where('seats', '>=', (int) $filters['seats']);
        }

        if (! empty($filters['price_max'])) {
            $query->where('daily_price', '<=', $filters['price_max']);
        }

        return $query->orderBy('daily_price')->get();
    }

    /**
     * Krijon një rezervim me mbrojtje kundër double-booking.
     *
     * Strategjia:
     *   1. Fillo DB transaction
     *   2. Bëj SELECT ... FOR UPDATE mbi vehicle (lock)
     *   3. Kontrollo overlap PËRSËRI me lock-in e mbajtur
     *   4. Krijo rezervimin
     *   5. Commit
     *
     * Në PostgreSQL, `lockForUpdate` vendos një row lock që bllokon transaksione
     * të tjera konkurente që provojnë të njëjtën gjë. Kjo garanton 0 double-booking.
     *
     * @param  array  $data  Të dhënat e rezervimit (pa reservation_code)
     * @throws BookingConflictException
     */
    public function createReservationSafely(array $data): \App\Models\Reservation
    {
        return DB::transaction(function () use ($data) {
            // 1. Lock vehicle row — bllokon transaksione të tjera
            $vehicle = Vehicle::query()
                ->where('id', $data['vehicle_id'])
                ->lockForUpdate()
                ->first();

            if (! $vehicle) {
                throw new BookingConflictException('Automjeti nuk u gjet.');
            }

            // 2. Verifiko statusin e vehicle (mund të jetë maintenance, rented, etj.)
            if ($vehicle->status !== VehicleStatus::AVAILABLE) {
                throw new BookingConflictException(
                    "Automjeti nuk është i disponueshëm (statusi: {$vehicle->status->label()})."
                );
            }

            // 3. Re-check overlap me lock-in e mbajtur
            if ($this->hasOverlappingReservation(
                $vehicle->id,
                $data['pickup_at'],
                $data['return_at'],
            )) {
                throw new BookingConflictException();
            }

            // 4. Krijo rezervimin
            $data['reservation_code'] = \App\Models\Reservation::generateCode();

            return \App\Models\Reservation::create($data);
        });
    }
}
