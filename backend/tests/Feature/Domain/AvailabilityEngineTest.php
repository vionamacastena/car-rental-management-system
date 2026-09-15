<?php

use App\Domain\Availability\AvailabilityEngine;
use App\Domain\Availability\BookingConflictException;
use App\Enums\ReservationStatus;
use App\Enums\VehicleStatus;
use App\Models\Customer;
use App\Models\Location;
use App\Models\Reservation;
use App\Models\Vehicle;
use Carbon\Carbon;

beforeEach(function () {
    $this->engine = app(AvailabilityEngine::class);
    $this->vehicle = Vehicle::factory()->create([
        'status' => VehicleStatus::AVAILABLE->value,
    ]);
    $this->customer = Customer::factory()->create();
    $this->pickupLoc = Location::factory()->create();
    $this->returnLoc = Location::factory()->create();
});

function makeReservation($vehicle, $customer, $pickupLoc, $returnLoc, string $pickup, string $return, $status = null)
{
    return Reservation::factory()->create([
        'vehicle_id' => $vehicle->id,
        'customer_id' => $customer->id,
        'pickup_location_id' => $pickupLoc->id,
        'return_location_id' => $returnLoc->id,
        'pickup_at' => $pickup,
        'return_at' => $return,
        'status' => $status ?? ReservationStatus::RESERVED,
    ]);
}

it('returns true when no reservations exist', function () {
    $result = $this->engine->isVehicleAvailable(
        $this->vehicle->id,
        Carbon::parse('2026-10-10 10:00'),
        Carbon::parse('2026-10-15 10:00'),
    );

    expect($result)->toBeTrue();
});

it('detects full overlap', function () {
    makeReservation($this->vehicle, $this->customer, $this->pickupLoc, $this->returnLoc,
        '2026-10-10 10:00', '2026-10-15 10:00');

    $result = $this->engine->isVehicleAvailable(
        $this->vehicle->id,
        Carbon::parse('2026-10-12 10:00'),
        Carbon::parse('2026-10-18 10:00'),
    );

    expect($result)->toBeFalse();
});

it('detects partial overlap (left)', function () {
    makeReservation($this->vehicle, $this->customer, $this->pickupLoc, $this->returnLoc,
        '2026-10-10 10:00', '2026-10-15 10:00');

    $result = $this->engine->isVehicleAvailable(
        $this->vehicle->id,
        Carbon::parse('2026-10-05 10:00'),
        Carbon::parse('2026-10-12 10:00'),
    );

    expect($result)->toBeFalse();
});

it('detects partial overlap (right)', function () {
    makeReservation($this->vehicle, $this->customer, $this->pickupLoc, $this->returnLoc,
        '2026-10-10 10:00', '2026-10-15 10:00');

    $result = $this->engine->isVehicleAvailable(
        $this->vehicle->id,
        Carbon::parse('2026-10-14 10:00'),
        Carbon::parse('2026-10-20 10:00'),
    );

    expect($result)->toBeFalse();
});

it('detects full containment', function () {
    makeReservation($this->vehicle, $this->customer, $this->pickupLoc, $this->returnLoc,
        '2026-10-10 10:00', '2026-10-20 10:00');

    $result = $this->engine->isVehicleAvailable(
        $this->vehicle->id,
        Carbon::parse('2026-10-12 10:00'),
        Carbon::parse('2026-10-15 10:00'),
    );

    expect($result)->toBeFalse();
});

it('allows adjacent bookings (end == start)', function () {
    makeReservation($this->vehicle, $this->customer, $this->pickupLoc, $this->returnLoc,
        '2026-10-10 10:00', '2026-10-15 10:00');

    // Rezervimi i re fillon saktësisht kur mbaron i vjetri
    $result = $this->engine->isVehicleAvailable(
        $this->vehicle->id,
        Carbon::parse('2026-10-15 10:00'),
        Carbon::parse('2026-10-20 10:00'),
    );

    expect($result)->toBeTrue();
});

it('ignores cancelled reservations', function () {
    makeReservation($this->vehicle, $this->customer, $this->pickupLoc, $this->returnLoc,
        '2026-10-10 10:00', '2026-10-15 10:00', ReservationStatus::CANCELLED);

    $result = $this->engine->isVehicleAvailable(
        $this->vehicle->id,
        Carbon::parse('2026-10-12 10:00'),
        Carbon::parse('2026-10-18 10:00'),
    );

    expect($result)->toBeTrue();
});

it('ignores completed and no_show reservations', function () {
    makeReservation($this->vehicle, $this->customer, $this->pickupLoc, $this->returnLoc,
        '2026-10-10 10:00', '2026-10-15 10:00', ReservationStatus::COMPLETED);
    makeReservation($this->vehicle, $this->customer, $this->pickupLoc, $this->returnLoc,
        '2026-10-20 10:00', '2026-10-25 10:00', ReservationStatus::NO_SHOW);

    $result = $this->engine->isVehicleAvailable(
        $this->vehicle->id,
        Carbon::parse('2026-10-12 10:00'),
        Carbon::parse('2026-10-18 10:00'),
    );

    expect($result)->toBeTrue();
});

it('blocks on active, picked_up, overdue reservations', function () {
    foreach ([ReservationStatus::ACTIVE, ReservationStatus::PICKED_UP, ReservationStatus::OVERDUE] as $status) {
        $v = Vehicle::factory()->create(['status' => VehicleStatus::AVAILABLE->value]);
        makeReservation($v, $this->customer, $this->pickupLoc, $this->returnLoc,
            '2026-10-10 10:00', '2026-10-15 10:00', $status);

        $result = $this->engine->isVehicleAvailable(
            $v->id,
            Carbon::parse('2026-10-12 10:00'),
            Carbon::parse('2026-10-18 10:00'),
        );

        expect($result)->toBeFalse();
    }
});

it('excludes a given reservation id when checking', function () {
    $r = makeReservation($this->vehicle, $this->customer, $this->pickupLoc, $this->returnLoc,
        '2026-10-10 10:00', '2026-10-15 10:00');

    $result = $this->engine->isVehicleAvailable(
        $this->vehicle->id,
        Carbon::parse('2026-10-12 10:00'),
        Carbon::parse('2026-10-15 10:00'),
        excludeReservationId: $r->id,
    );

    expect($result)->toBeTrue();
});

it('does not conflict across different vehicles', function () {
    $otherVehicle = Vehicle::factory()->create(['status' => VehicleStatus::AVAILABLE->value]);
    makeReservation($otherVehicle, $this->customer, $this->pickupLoc, $this->returnLoc,
        '2026-10-10 10:00', '2026-10-15 10:00');

    $result = $this->engine->isVehicleAvailable(
        $this->vehicle->id,
        Carbon::parse('2026-10-12 10:00'),
        Carbon::parse('2026-10-18 10:00'),
    );

    expect($result)->toBeTrue();
});

it('findAvailableVehicles returns only available ones', function () {
    $a = Vehicle::factory()->create(['status' => VehicleStatus::AVAILABLE->value, 'daily_price' => 40]);
    $b = Vehicle::factory()->create(['status' => VehicleStatus::AVAILABLE->value, 'daily_price' => 50]);
    $c = Vehicle::factory()->create(['status' => VehicleStatus::AVAILABLE->value, 'daily_price' => 60]);

    makeReservation($b, $this->customer, $this->pickupLoc, $this->returnLoc,
        '2026-10-10 10:00', '2026-10-15 10:00');

    $available = $this->engine->findAvailableVehicles(
        Carbon::parse('2026-10-12 10:00'),
        Carbon::parse('2026-10-14 10:00'),
    );

    $ids = $available->pluck('id')->all();
    expect($ids)->toContain($a->id, $c->id);
    expect($ids)->not->toContain($b->id);
});

it('findAvailableVehicles excludes non-available vehicle statuses', function () {
    $maintenance = Vehicle::factory()->create(['status' => VehicleStatus::MAINTENANCE->value]);
    $rented = Vehicle::factory()->create(['status' => VehicleStatus::RENTED->value]);

    $result = $this->engine->findAvailableVehicles(
        Carbon::parse('2026-10-12 10:00'),
        Carbon::parse('2026-10-14 10:00'),
    );

    $ids = $result->pluck('id')->all();
    expect($ids)->not->toContain($maintenance->id);
    expect($ids)->not->toContain($rented->id);
    expect($ids)->toContain($this->vehicle->id); // available nga beforeEach
});
it('createReservationSafely throws on overlap', function () {
    makeReservation($this->vehicle, $this->customer, $this->pickupLoc, $this->returnLoc,
        '2026-10-10 10:00', '2026-10-15 10:00');

    expect(fn () => $this->engine->createReservationSafely([
        'customer_id' => $this->customer->id,
        'vehicle_id' => $this->vehicle->id,
        'pickup_location_id' => $this->pickupLoc->id,
        'return_location_id' => $this->returnLoc->id,
        'pickup_at' => Carbon::parse('2026-10-12 10:00'),
        'return_at' => Carbon::parse('2026-10-18 10:00'),
        'days' => 6,
        'daily_price_snapshot' => 50,
        'subtotal' => 300,
        'total' => 300,
    ]))->toThrow(BookingConflictException::class);
});

it('createReservationSafely creates when no overlap', function () {
    $r = $this->engine->createReservationSafely([
        'customer_id' => $this->customer->id,
        'vehicle_id' => $this->vehicle->id,
        'pickup_location_id' => $this->pickupLoc->id,
        'return_location_id' => $this->returnLoc->id,
        'pickup_at' => Carbon::parse('2026-10-10 10:00'),
        'return_at' => Carbon::parse('2026-10-15 10:00'),
        'days' => 5,
        'daily_price_snapshot' => 50,
        'subtotal' => 250,
        'total' => 250,
    ]);

    expect($r)->toBeInstanceOf(Reservation::class);
    expect($r->reservation_code)->toStartWith('RES-' . now()->year . '-');
    $this->assertDatabaseHas('reservations', ['id' => $r->id]);
});

it('createReservationSafely rejects non-available vehicle status', function () {
    $this->vehicle->update(['status' => VehicleStatus::MAINTENANCE->value]);

    expect(fn () => $this->engine->createReservationSafely([
        'customer_id' => $this->customer->id,
        'vehicle_id' => $this->vehicle->id,
        'pickup_location_id' => $this->pickupLoc->id,
        'return_location_id' => $this->returnLoc->id,
        'pickup_at' => Carbon::parse('2026-10-10 10:00'),
        'return_at' => Carbon::parse('2026-10-15 10:00'),
        'days' => 5,
        'daily_price_snapshot' => 50,
        'subtotal' => 250,
        'total' => 250,
    ]))->toThrow(BookingConflictException::class);
});

it('generates sequential reservation codes', function () {
    $r1 = $this->engine->createReservationSafely([
        'customer_id' => $this->customer->id,
        'vehicle_id' => $this->vehicle->id,
        'pickup_location_id' => $this->pickupLoc->id,
        'return_location_id' => $this->returnLoc->id,
        'pickup_at' => Carbon::parse('2026-10-10 10:00'),
        'return_at' => Carbon::parse('2026-10-15 10:00'),
        'days' => 5, 'daily_price_snapshot' => 50, 'subtotal' => 250, 'total' => 250,
    ]);

    $otherVehicle = Vehicle::factory()->create(['status' => VehicleStatus::AVAILABLE->value]);
    $r2 = $this->engine->createReservationSafely([
        'customer_id' => $this->customer->id,
        'vehicle_id' => $otherVehicle->id,
        'pickup_location_id' => $this->pickupLoc->id,
        'return_location_id' => $this->returnLoc->id,
        'pickup_at' => Carbon::parse('2026-10-10 10:00'),
        'return_at' => Carbon::parse('2026-10-15 10:00'),
        'days' => 5, 'daily_price_snapshot' => 50, 'subtotal' => 250, 'total' => 250,
    ]);

    expect($r1->reservation_code)->toBe('RES-' . now()->year . '-0001');
    expect($r2->reservation_code)->toBe('RES-' . now()->year . '-0002');
});
