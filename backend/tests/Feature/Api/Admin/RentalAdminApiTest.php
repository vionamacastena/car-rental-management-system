<?php

use App\Enums\RentalStatus;
use App\Enums\ReservationStatus;
use App\Enums\VehicleStatus;
use App\Models\Rental;
use App\Models\Reservation;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Support\Facades\Hash;

beforeEach(function () {
    $this->admin = User::factory()->create([
        'email' => 'admin@test.com',
        'password' => Hash::make('password123'),
        'is_active' => true,
    ]);
    $this->token = $this->admin->createToken('test')->plainTextToken;
    $this->headers = ['Authorization' => "Bearer {$this->token}"];
});

it('requires authentication', function () {
    $this->getJson('/api/v1/admin/rentals')->assertUnauthorized();
});

it('lists rentals', function () {
    Rental::factory()->count(3)->create();

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/rentals');

    $response->assertOk()->assertJsonCount(3, 'data');
});

it('filters only open rentals', function () {
    Rental::factory()->create(['status' => RentalStatus::PENDING_CHECKOUT]);
    Rental::factory()->create(['status' => RentalStatus::ACTIVE]);
    Rental::factory()->create(['status' => RentalStatus::COMPLETED]);

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/rentals?open_only=1');

    $response->assertOk()->assertJsonCount(2, 'data');
});

it('starts a rental from a reserved reservation', function () {
    $reservation = Reservation::factory()->create([
        'status' => ReservationStatus::RESERVED,
        'subtotal' => 250,
        'total' => 250,
        'deposit_amount' => 200,
    ]);

    $response = $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/rentals', [
            'reservation_id' => $reservation->id,
        ]);

    $response->assertCreated()
        ->assertJsonPath('data.status.value', 'pending_checkout');

    $rental = Rental::first();
    expect($rental->reservation_id)->toBe($reservation->id);
    expect((float) $rental->total_amount)->toBe(250.00);
});

it('rejects starting rental from non-reserved reservation', function () {
    $reservation = Reservation::factory()->create([
        'status' => ReservationStatus::CANCELLED,
        'cancelled_at' => now(),
    ]);

    $response = $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/rentals', [
            'reservation_id' => $reservation->id,
        ]);

    $response->assertStatus(409);
});

it('performs check-out and updates related entities', function () {
    $vehicle = Vehicle::factory()->create([
        'status' => VehicleStatus::AVAILABLE->value,
        'mileage' => 10000,
    ]);
    $reservation = Reservation::factory()->create([
        'status' => ReservationStatus::RESERVED,
        'vehicle_id' => $vehicle->id,
    ]);
    $rental = Rental::factory()->create([
        'reservation_id' => $reservation->id,
        'vehicle_id' => $vehicle->id,
        'status' => RentalStatus::PENDING_CHECKOUT,
    ]);

    $response = $this->withHeaders($this->headers)
        ->postJson("/api/v1/admin/rentals/{$rental->id}/checkout", [
            'pickup_mileage' => 10500,
            'pickup_fuel_level' => 100,
            'checkout_condition' => [
                'exterior' => 'good',
                'interior' => 'clean',
                'existing_damages' => [],
            ],
            'checkout_notes' => 'Klient mori makinën në orar',
        ]);

    $response->assertOk()
        ->assertJsonPath('data.status.value', 'active')
        ->assertJsonPath('data.mileage.pickup', 10500)
        ->assertJsonPath('data.fuel.pickup_level', 100);

    expect($rental->fresh()->status)->toBe(RentalStatus::ACTIVE);
    expect($vehicle->fresh()->status)->toBe(VehicleStatus::RENTED);
    expect($vehicle->fresh()->mileage)->toBe(10500);
    expect($reservation->fresh()->status)->toBe(ReservationStatus::PICKED_UP);
});

it('refuses check-out on non-pending rental', function () {
    $rental = Rental::factory()->create(['status' => RentalStatus::ACTIVE]);

    $response = $this->withHeaders($this->headers)
        ->postJson("/api/v1/admin/rentals/{$rental->id}/checkout", [
            'pickup_mileage' => 10000,
            'pickup_fuel_level' => 100,
        ]);

    $response->assertStatus(409);
});

it('validates check-out fields', function () {
    $rental = Rental::factory()->create(['status' => RentalStatus::PENDING_CHECKOUT]);

    $response = $this->withHeaders($this->headers)
        ->postJson("/api/v1/admin/rentals/{$rental->id}/checkout", []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['pickup_mileage', 'pickup_fuel_level']);
});

it('cancels a pending rental', function () {
    $rental = Rental::factory()->create(['status' => RentalStatus::PENDING_CHECKOUT]);

    $response = $this->withHeaders($this->headers)
        ->postJson("/api/v1/admin/rentals/{$rental->id}/cancel");

    $response->assertOk()->assertJsonPath('data.status.value', 'cancelled');
});

it('refuses to cancel an active rental', function () {
    $rental = Rental::factory()->create(['status' => RentalStatus::ACTIVE]);

    $response = $this->withHeaders($this->headers)
        ->postJson("/api/v1/admin/rentals/{$rental->id}/cancel");

    $response->assertStatus(409);
});

it('performs check-in and completes the rental', function () {
    $vehicle = Vehicle::factory()->create(['status' => VehicleStatus::RENTED->value, 'mileage' => 10000]);
    $rental = Rental::factory()->create([
        'vehicle_id' => $vehicle->id,
        'status' => RentalStatus::ACTIVE,
        'pickup_mileage' => 10000,
        'deposit_amount' => 300,
        'base_amount' => 250,
        'total_amount' => 250,
    ]);

    $response = $this->withHeaders($this->headers)
        ->postJson("/api/v1/admin/rentals/{$rental->id}/checkin", [
            'return_mileage' => 10650,
            'return_fuel_level' => 75,
            'checkin_condition' => [
                'exterior' => 'good',
                'interior' => 'clean',
                'new_damages' => [],
            ],
            'checkin_notes' => 'Kthyer në orar',
        ]);

    $response->assertOk()
        ->assertJsonPath('data.status.value', 'completed')
        ->assertJsonPath('data.mileage.used', 650);

    expect($rental->fresh()->status)->toBe(RentalStatus::COMPLETED);
    expect($vehicle->fresh()->status)->toBe(VehicleStatus::CLEANING);
});

it('marks vehicle as damaged when new damage is reported', function () {
    $vehicle = Vehicle::factory()->create(['status' => VehicleStatus::RENTED->value, 'mileage' => 10000]);
    $rental = Rental::factory()->create([
        'vehicle_id' => $vehicle->id,
        'status' => RentalStatus::ACTIVE,
        'pickup_mileage' => 10000,
        'deposit_amount' => 300,
        'base_amount' => 250,
        'total_amount' => 250,
    ]);

    $response = $this->withHeaders($this->headers)
        ->postJson("/api/v1/admin/rentals/{$rental->id}/checkin", [
            'return_mileage' => 10650,
            'return_fuel_level' => 100,
            'checkin_condition' => [
                'exterior' => 'damaged',
                'new_damages' => [
                    ['area' => 'front_bumper', 'type' => 'scratch', 'severity' => 'minor'],
                ],
            ],
            'damage_charge' => 150,
        ]);

    $response->assertOk();
    expect($vehicle->fresh()->status)->toBe(VehicleStatus::DAMAGED);
    expect((float) $rental->fresh()->damage_amount)->toBe(150.0);
});

it('calculates deposit deduction and refund correctly', function () {
    $rental = Rental::factory()->create([
        'status' => RentalStatus::ACTIVE,
        'pickup_mileage' => 10000,
        'deposit_amount' => 300,
        'base_amount' => 250,
        'total_amount' => 250,
    ]);

    $this->withHeaders($this->headers)
        ->postJson("/api/v1/admin/rentals/{$rental->id}/checkin", [
            'return_mileage' => 10500,
            'return_fuel_level' => 100,
            'damage_charge' => 120,
        ])
        ->assertOk();

    $fresh = $rental->fresh();
    expect((float) $fresh->deposit_deduction)->toBe(120.0);
    expect((float) $fresh->deposit_refund)->toBe(180.0);
    expect((float) $fresh->total_amount)->toBe(370.0); // 250 + 120
});

it('refuses check-in on non-active rental', function () {
    $rental = Rental::factory()->create(['status' => RentalStatus::PENDING_CHECKOUT]);

    $response = $this->withHeaders($this->headers)
        ->postJson("/api/v1/admin/rentals/{$rental->id}/checkin", [
            'return_mileage' => 10500,
            'return_fuel_level' => 100,
        ]);

    $response->assertStatus(409);
});

it('validates check-in fields', function () {
    $rental = Rental::factory()->create(['status' => RentalStatus::ACTIVE]);

    $response = $this->withHeaders($this->headers)
        ->postJson("/api/v1/admin/rentals/{$rental->id}/checkin", []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['return_mileage', 'return_fuel_level']);
});

it('creates deposit settlement payments on check-in', function () {
    $vehicle = Vehicle::factory()->create(['status' => VehicleStatus::RENTED->value, 'mileage' => 10000]);
    $rental = Rental::factory()->create([
        'vehicle_id' => $vehicle->id,
        'status' => RentalStatus::ACTIVE,
        'pickup_mileage' => 10000,
        'deposit_amount' => 300,
        'base_amount' => 250,
        'total_amount' => 250,
    ]);

    $this->withHeaders($this->headers)
        ->postJson("/api/v1/admin/rentals/{$rental->id}/checkin", [
            'return_mileage' => 10500,
            'return_fuel_level' => 100,
            'damage_charge' => 120,
        ])
        ->assertOk();

    // Duhet: 1 EXTRA_CHARGE (120) + 1 DEPOSIT_REFUND (180)
    $payments = \App\Models\Payment::where('payable_id', $rental->id)
        ->where('payable_type', \App\Models\Rental::class)
        ->get();

    expect($payments)->toHaveCount(2);

    $deduction = $payments->firstWhere(fn ($p) => $p->type->value === 'extra_charge');
    $refund = $payments->firstWhere(fn ($p) => $p->type->value === 'deposit_refund');

    expect((float) $deduction->amount)->toBe(120.0);
    expect((float) $refund->amount)->toBe(180.0);
});

it('does not create payments when deposit is zero', function () {
    $vehicle = Vehicle::factory()->create(['status' => VehicleStatus::RENTED->value, 'mileage' => 10000]);
    $rental = Rental::factory()->create([
        'vehicle_id' => $vehicle->id,
        'status' => RentalStatus::ACTIVE,
        'pickup_mileage' => 10000,
        'deposit_amount' => 0,
        'base_amount' => 250,
        'total_amount' => 250,
    ]);

    $this->withHeaders($this->headers)
        ->postJson("/api/v1/admin/rentals/{$rental->id}/checkin", [
            'return_mileage' => 10500,
            'return_fuel_level' => 100,
        ])
        ->assertOk();

    $count = \App\Models\Payment::where('payable_id', $rental->id)->count();
    expect($count)->toBe(0);
});

it('allows disabling auto payment creation', function () {
    $vehicle = Vehicle::factory()->create(['status' => VehicleStatus::RENTED->value, 'mileage' => 10000]);
    $rental = Rental::factory()->create([
        'vehicle_id' => $vehicle->id,
        'status' => RentalStatus::ACTIVE,
        'pickup_mileage' => 10000,
        'deposit_amount' => 300,
        'base_amount' => 250,
        'total_amount' => 250,
    ]);

    $this->withHeaders($this->headers)
        ->postJson("/api/v1/admin/rentals/{$rental->id}/checkin", [
            'return_mileage' => 10500,
            'return_fuel_level' => 100,
            'damage_charge' => 120,
            'create_payments' => false,
        ])
        ->assertOk();

    $count = \App\Models\Payment::where('payable_id', $rental->id)->count();
    expect($count)->toBe(0);
});
