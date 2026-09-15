<?php

use App\Domain\Rentals\RentalService;
use App\Enums\RentalStatus;
use App\Enums\ReservationStatus;
use App\Models\Rental;
use App\Models\Reservation;
use Illuminate\Support\Facades\DB;

beforeEach(function () {
    $this->service = app(RentalService::class);
});

it('creates a rental from a reserved reservation', function () {
    $reservation = Reservation::factory()->create([
        'status' => ReservationStatus::RESERVED,
        'subtotal' => 250,
        'total' => 275,
        'deposit_amount' => 200,
    ]);

    $rental = $this->service->createFromReservation($reservation);

    expect($rental)->toBeInstanceOf(Rental::class);
    expect($rental->rental_code)->toStartWith('RNT-' . now()->year . '-');
    expect($rental->status)->toBe(RentalStatus::PENDING_CHECKOUT);
    expect($rental->reservation_id)->toBe($reservation->id);
    expect((float) $rental->base_amount)->toBe(250.00);
    expect((float) $rental->total_amount)->toBe(275.00);
    expect((float) $rental->deposit_amount)->toBe(200.00);

    $this->assertDatabaseHas('rentals', ['id' => $rental->id]);
});

it('is idempotent — returns existing rental if already created', function () {
    $reservation = Reservation::factory()->create(['status' => ReservationStatus::RESERVED]);

    $first = $this->service->createFromReservation($reservation);
    $second = $this->service->createFromReservation($reservation);

    expect($first->id)->toBe($second->id);
    expect(Rental::count())->toBe(1);
});

it('rejects converting a cancelled reservation', function () {
    $reservation = Reservation::factory()->create([
        'status' => ReservationStatus::CANCELLED,
        'cancelled_at' => now(),
    ]);

    expect(fn () => $this->service->createFromReservation($reservation))
        ->toThrow(RuntimeException::class);
});

it('rejects converting a completed reservation', function () {
    $reservation = Reservation::factory()->create([
        'status' => ReservationStatus::COMPLETED,
    ]);

    expect(fn () => $this->service->createFromReservation($reservation))
        ->toThrow(RuntimeException::class);
});

it('generates sequential rental codes', function () {
    $r1 = Reservation::factory()->create(['status' => ReservationStatus::RESERVED]);
    $r2 = Reservation::factory()->create(['status' => ReservationStatus::RESERVED]);

    $rental1 = $this->service->createFromReservation($r1);
    $rental2 = $this->service->createFromReservation($r2);

    expect($rental1->rental_code)->toBe('RNT-' . now()->year . '-0001');
    expect($rental2->rental_code)->toBe('RNT-' . now()->year . '-0002');
});

it('copies pricing snapshot from reservation', function () {
    $reservation = Reservation::factory()->create([
        'status' => ReservationStatus::RESERVED,
        'subtotal' => 400,
        'extras_total' => 50,
        'fees_total' => 10,
        'taxes_total' => 30,
        'discount_total' => 20,
        'total' => 470,
        'deposit_amount' => 300,
    ]);

    $rental = $this->service->createFromReservation($reservation);

    expect((float) $rental->base_amount)->toBe(400.00)
        ->and((float) $rental->extras_amount)->toBe(50.00)
        ->and((float) $rental->fees_amount)->toBe(10.00)
        ->and((float) $rental->taxes_amount)->toBe(30.00)
        ->and((float) $rental->discount_amount)->toBe(20.00)
        ->and((float) $rental->total_amount)->toBe(470.00)
        ->and((float) $rental->deposit_amount)->toBe(300.00);
});
