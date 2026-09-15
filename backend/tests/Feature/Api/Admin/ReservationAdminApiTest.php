<?php

use App\Enums\ReservationStatus;
use App\Enums\VehicleStatus;
use App\Models\Customer;
use App\Models\Location;
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

    $this->customer = Customer::factory()->create();
    $this->vehicle = Vehicle::factory()->create([
        'status' => VehicleStatus::AVAILABLE->value,
        'daily_price' => 50,
    ]);
    $this->pickupLoc = Location::factory()->create();
    $this->returnLoc = Location::factory()->create();
});

it('requires authentication', function () {
    $this->getJson('/api/v1/admin/reservations')->assertUnauthorized();
});

it('lists all reservations', function () {
    Reservation::factory()->count(3)->create();
    Reservation::factory()->count(2)->create(['status' => ReservationStatus::CANCELLED]);

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/reservations');

    $response->assertOk()->assertJsonCount(5, 'data');
});

it('searches by reservation code', function () {
    Reservation::factory()->create(['reservation_code' => 'RES-2026-0099']);
    Reservation::factory()->create(['reservation_code' => 'RES-2026-0100']);

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/reservations?search=0099');

    $response->assertOk()->assertJsonCount(1, 'data');
});

it('filters by status', function () {
    Reservation::factory()->count(2)->create(['status' => ReservationStatus::RESERVED]);
    Reservation::factory()->create(['status' => ReservationStatus::CANCELLED]);

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/reservations?status=cancelled');

    $response->assertOk()->assertJsonCount(1, 'data');
});

it('creates a reservation via admin', function () {
    $pickup = now()->addDays(5)->format('Y-m-d H:i:s');
    $return = now()->addDays(10)->format('Y-m-d H:i:s');

    $response = $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/reservations', [
            'customer_id' => $this->customer->id,
            'vehicle_id' => $this->vehicle->id,
            'pickup_location_id' => $this->pickupLoc->id,
            'return_location_id' => $this->returnLoc->id,
            'pickup_at' => $pickup,
            'return_at' => $return,
            'notes' => 'Klient biznesi',
        ]);

    $response->assertCreated()
        ->assertJsonPath('data.status.value', 'reserved')
        ->assertJsonPath('data.source.value', 'admin');

    $reservation = Reservation::first();
    expect($reservation->days)->toBe(5);
    expect((float) $reservation->subtotal)->toBe(250.00); // 5 * 50
    expect($reservation->reservation_code)->toStartWith('RES-' . now()->year . '-');
});

it('rejects overlapping reservation on same vehicle with 409', function () {
    // Ekziston një rezervim
    Reservation::factory()->create([
        'vehicle_id' => $this->vehicle->id,
        'pickup_at' => now()->addDays(5),
        'return_at' => now()->addDays(10),
        'status' => ReservationStatus::RESERVED,
    ]);

    // Provojmë overlap
    $response = $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/reservations', [
            'customer_id' => $this->customer->id,
            'vehicle_id' => $this->vehicle->id,
            'pickup_location_id' => $this->pickupLoc->id,
            'return_location_id' => $this->returnLoc->id,
            'pickup_at' => now()->addDays(7)->format('Y-m-d H:i:s'),
            'return_at' => now()->addDays(12)->format('Y-m-d H:i:s'),
        ]);

    $response->assertStatus(409);
    expect(Reservation::count())->toBe(1);
});

it('validates required fields on create', function () {
    $response = $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/reservations', []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors([
            'customer_id', 'vehicle_id', 'pickup_location_id',
            'return_location_id', 'pickup_at', 'return_at',
        ]);
});

it('shows a reservation with relations', function () {
    $reservation = Reservation::factory()->create();

    $response = $this->withHeaders($this->headers)
        ->getJson("/api/v1/admin/reservations/{$reservation->id}");

    $response->assertOk()
        ->assertJsonPath('data.id', $reservation->id)
        ->assertJsonStructure([
            'data' => ['customer', 'vehicle', 'pickup_location', 'return_location'],
        ]);
});

it('updates notes and internal_notes', function () {
    $reservation = Reservation::factory()->create(['notes' => 'Old']);

    $response = $this->withHeaders($this->headers)
        ->putJson("/api/v1/admin/reservations/{$reservation->id}", [
            'notes' => 'New note',
            'internal_notes' => 'VIP customer',
        ]);

    $response->assertOk();
    expect($reservation->fresh()->notes)->toBe('New note');
    expect($reservation->fresh()->internal_notes)->toBe('VIP customer');
});

it('refuses to edit a cancelled reservation', function () {
    $reservation = Reservation::factory()->create(['status' => ReservationStatus::CANCELLED]);

    $response = $this->withHeaders($this->headers)
        ->putJson("/api/v1/admin/reservations/{$reservation->id}", [
            'notes' => 'Try edit',
        ]);

    $response->assertStatus(409);
});

it('cancels a reservation', function () {
    $reservation = Reservation::factory()->create(['status' => ReservationStatus::RESERVED]);

    $response = $this->withHeaders($this->headers)
        ->postJson("/api/v1/admin/reservations/{$reservation->id}/cancel", [
            'reason' => 'Klienti anuloi',
        ]);

    $response->assertOk()
        ->assertJsonPath('data.status.value', 'cancelled')
        ->assertJsonPath('data.cancelled_reason', 'Klienti anuloi');

    $fresh = $reservation->fresh();
    expect($fresh->cancelled_at)->not->toBeNull();
});

it('refuses to cancel an already cancelled reservation', function () {
    $reservation = Reservation::factory()->create(['status' => ReservationStatus::CANCELLED]);

    $response = $this->withHeaders($this->headers)
        ->postJson("/api/v1/admin/reservations/{$reservation->id}/cancel");

    $response->assertStatus(409);
});

it('updates status', function () {
    $reservation = Reservation::factory()->create(['status' => ReservationStatus::RESERVED]);

    $response = $this->withHeaders($this->headers)
        ->patchJson("/api/v1/admin/reservations/{$reservation->id}/status", [
            'status' => ReservationStatus::ACTIVE->value,
        ]);

    $response->assertOk()->assertJsonPath('data.status.value', 'active');
});

it('refuses to un-close a cancelled reservation', function () {
    $reservation = Reservation::factory()->create([
        'status' => ReservationStatus::CANCELLED,
        'cancelled_at' => now(),
    ]);

    $response = $this->withHeaders($this->headers)
        ->patchJson("/api/v1/admin/reservations/{$reservation->id}/status", [
            'status' => ReservationStatus::RESERVED->value,
        ]);

    $response->assertStatus(409);
});

it('physically deletes only cancelled reservations', function () {
    $active = Reservation::factory()->create(['status' => ReservationStatus::RESERVED]);
    $cancelled = Reservation::factory()->create([
        'status' => ReservationStatus::CANCELLED,
        'cancelled_at' => now(),
    ]);

    $this->withHeaders($this->headers)
        ->deleteJson("/api/v1/admin/reservations/{$active->id}")
        ->assertStatus(409);

    $this->withHeaders($this->headers)
        ->deleteJson("/api/v1/admin/reservations/{$cancelled->id}")
        ->assertOk();

    $this->assertDatabaseMissing('reservations', ['id' => $cancelled->id]);
    $this->assertDatabaseHas('reservations', ['id' => $active->id]);
});

it('rejects creating reservation for maintenance vehicle', function () {
    $this->vehicle->update(['status' => VehicleStatus::MAINTENANCE->value]);

    $response = $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/reservations', [
            'customer_id' => $this->customer->id,
            'vehicle_id' => $this->vehicle->id,
            'pickup_location_id' => $this->pickupLoc->id,
            'return_location_id' => $this->returnLoc->id,
            'pickup_at' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'return_at' => now()->addDays(10)->format('Y-m-d H:i:s'),
        ]);

    $response->assertStatus(409);
});

it('filters upcoming reservations', function () {
    Reservation::factory()->create([
        'pickup_at' => now()->addDays(3),
        'return_at' => now()->addDays(5),
        'status' => ReservationStatus::RESERVED,
    ]);
    Reservation::factory()->create([
        'pickup_at' => now()->subDays(5),
        'return_at' => now()->subDays(3),
        'status' => ReservationStatus::COMPLETED,
    ]);

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/reservations?upcoming=1');

    $response->assertOk()->assertJsonCount(1, 'data');
});
