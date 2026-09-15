<?php

use App\Enums\ReservationStatus;
use App\Enums\VehicleStatus;
use App\Models\Customer;
use App\Models\Location;
use App\Models\Reservation;
use App\Models\Vehicle;

beforeEach(function () {
    $this->vehicle = Vehicle::factory()->create([
        'status' => VehicleStatus::AVAILABLE->value,
        'daily_price' => 50,
    ]);
    $this->pickupLoc = Location::factory()->create();
    $this->returnLoc = Location::factory()->create();
});

function validBookingPayload($vehicle, $pickupLoc, $returnLoc, array $overrides = []): array
{
    return array_merge([
        'vehicle_id' => $vehicle->id,
        'pickup_location_id' => $pickupLoc->id,
        'return_location_id' => $returnLoc->id,
        'pickup_at' => now()->addDays(5)->format('Y-m-d H:i:s'),
        'return_at' => now()->addDays(10)->format('Y-m-d H:i:s'),
        'first_name' => 'Arben',
        'last_name' => 'Krasniqi',
        'email' => 'arben@example.com',
        'phone' => '+383 44 111 222',
        'city' => 'Prishtina',
        'country' => 'Kosovo',
    ], $overrides);
}

it('creates a public booking without authentication', function () {
    $response = $this->postJson('/api/v1/reservations', validBookingPayload(
        $this->vehicle, $this->pickupLoc, $this->returnLoc
    ));

    $response->assertCreated()
        ->assertJsonPath('data.status.value', 'reserved')
        ->assertJsonPath('data.source.value', 'public')
        ->assertJsonPath('data.days', 5)
        ->assertJsonPath('data.pricing.subtotal', 250)
        ->assertJsonPath('data.pricing.total', 250)
        ->assertJsonPath('data.pricing.deposit_amount', 200);

    $this->assertDatabaseHas('reservations', ['vehicle_id' => $this->vehicle->id]);
    $this->assertDatabaseHas('customers', ['email' => 'arben@example.com']);
});

it('reuses existing customer by email + phone', function () {
    Customer::factory()->create([
        'email' => 'arben@example.com',
        'phone' => '+383 44 111 222',
        'first_name' => 'Old',
    ]);

    $this->postJson('/api/v1/reservations', validBookingPayload(
        $this->vehicle, $this->pickupLoc, $this->returnLoc
    ))->assertCreated();

    expect(Customer::count())->toBe(1);
    expect(Customer::first()->first_name)->toBe('Arben');
});

it('creates new customer if email+phone do not match', function () {
    Customer::factory()->create(['email' => 'a@a.com', 'phone' => '111']);

    $this->postJson('/api/v1/reservations', validBookingPayload(
        $this->vehicle, $this->pickupLoc, $this->returnLoc
    ))->assertCreated();

    expect(Customer::count())->toBe(2);
});

it('rejects overlapping booking with 409', function () {
    $pickup = now()->addDays(5);
    $return = now()->addDays(10);

    Reservation::factory()->create([
        'vehicle_id' => $this->vehicle->id,
        'pickup_at' => $pickup,
        'return_at' => $return,
        'status' => ReservationStatus::RESERVED,
    ]);

    $response = $this->postJson('/api/v1/reservations', validBookingPayload(
        $this->vehicle, $this->pickupLoc, $this->returnLoc, [
            'pickup_at' => now()->addDays(6)->format('Y-m-d H:i:s'),
            'return_at' => now()->addDays(12)->format('Y-m-d H:i:s'),
        ]
    ));

    $response->assertStatus(409)
        ->assertJsonPath('code', 'vehicle_unavailable');
});

it('rejects vehicle in maintenance', function () {
    $this->vehicle->update(['status' => VehicleStatus::MAINTENANCE->value]);

    $response = $this->postJson('/api/v1/reservations', validBookingPayload(
        $this->vehicle, $this->pickupLoc, $this->returnLoc
    ));

    $response->assertStatus(409);
});

it('validates required fields', function () {
    $response = $this->postJson('/api/v1/reservations', []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors([
            'vehicle_id', 'pickup_location_id', 'return_location_id',
            'pickup_at', 'return_at', 'first_name', 'last_name',
            'email', 'phone',
        ]);
});

it('rejects pickup in the past', function () {
    $response = $this->postJson('/api/v1/reservations', validBookingPayload(
        $this->vehicle, $this->pickupLoc, $this->returnLoc, [
            'pickup_at' => now()->subDay()->format('Y-m-d H:i:s'),
        ]
    ));

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['pickup_at']);
});

it('rejects return before pickup', function () {
    $response = $this->postJson('/api/v1/reservations', validBookingPayload(
        $this->vehicle, $this->pickupLoc, $this->returnLoc, [
            'pickup_at' => now()->addDays(10)->format('Y-m-d H:i:s'),
            'return_at' => now()->addDays(5)->format('Y-m-d H:i:s'),
        ]
    ));

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['return_at']);
});

it('rejects honeypot-filled submission', function () {
    $response = $this->postJson('/api/v1/reservations', validBookingPayload(
        $this->vehicle, $this->pickupLoc, $this->returnLoc, [
            'website' => 'http://spam.com',
        ]
    ));

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['website']);
});

it('looks up reservation by code + email', function () {
    $this->postJson('/api/v1/reservations', validBookingPayload(
        $this->vehicle, $this->pickupLoc, $this->returnLoc
    ))->assertCreated();

    $reservation = Reservation::first();

    $response = $this->postJson('/api/v1/reservations/lookup', [
        'code' => $reservation->reservation_code,
        'email' => 'arben@example.com',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.reservation_code', $reservation->reservation_code);
});

it('lookup is case-insensitive for email', function () {
    $this->postJson('/api/v1/reservations', validBookingPayload(
        $this->vehicle, $this->pickupLoc, $this->returnLoc
    ))->assertCreated();

    $reservation = Reservation::first();

    $this->postJson('/api/v1/reservations/lookup', [
        'code' => $reservation->reservation_code,
        'email' => 'ARBEN@example.com',
    ])->assertOk();
});

it('lookup returns 404 for wrong email', function () {
    $this->postJson('/api/v1/reservations', validBookingPayload(
        $this->vehicle, $this->pickupLoc, $this->returnLoc
    ))->assertCreated();

    $reservation = Reservation::first();

    $this->postJson('/api/v1/reservations/lookup', [
        'code' => $reservation->reservation_code,
        'email' => 'other@example.com',
    ])->assertNotFound();
});

it('lookup returns 404 for wrong code', function () {
    $this->postJson('/api/v1/reservations/lookup', [
        'code' => 'RES-9999-9999',
        'email' => 'arben@example.com',
    ])->assertNotFound();
});

it('rate limits booking attempts', function () {
    for ($i = 0; $i < 10; $i++) {
        $this->postJson('/api/v1/reservations', validBookingPayload(
            $this->vehicle, $this->pickupLoc, $this->returnLoc, [
                'email' => "user{$i}@example.com",
                'phone' => "+383 44 11{$i} 222",
                'pickup_at' => now()->addDays(20 + $i)->format('Y-m-d H:i:s'),
                'return_at' => now()->addDays(25 + $i)->format('Y-m-d H:i:s'),
            ]
        ));
    }

    $this->postJson('/api/v1/reservations', validBookingPayload(
        $this->vehicle, $this->pickupLoc, $this->returnLoc, [
            'email' => 'final@example.com',
            'phone' => '+383 44 999 999',
            'pickup_at' => now()->addDays(50)->format('Y-m-d H:i:s'),
            'return_at' => now()->addDays(55)->format('Y-m-d H:i:s'),
        ]
    ))->assertStatus(429);
});
