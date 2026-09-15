<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

it('rate limits login attempts per email+ip', function () {
    User::factory()->create([
        'email' => 'ratelimit@test.com',
        'password' => Hash::make('password123'),
        'is_active' => true,
    ]);

    // 5 tentativa të dështuara
    for ($i = 0; $i < 5; $i++) {
        $this->postJson('/api/v1/auth/login', [
            'email' => 'ratelimit@test.com',
            'password' => 'wrongpass123',
        ])->assertUnprocessable();
    }

    // E 6-ta → 429
    $this->postJson('/api/v1/auth/login', [
        'email' => 'ratelimit@test.com',
        'password' => 'wrongpass123',
    ])->assertStatus(429);
});

it('rate limits public booking per IP', function () {
    $vehicle = \App\Models\Vehicle::factory()->create(['status' => 'available']);
    $loc = \App\Models\Location::factory()->create();

    for ($i = 0; $i < 10; $i++) {
        $this->postJson('/api/v1/reservations', [
            'vehicle_id' => $vehicle->id,
            'pickup_location_id' => $loc->id,
            'return_location_id' => $loc->id,
            'pickup_at' => now()->addDays(100 + $i * 10)->format('Y-m-d H:i:s'),
            'return_at' => now()->addDays(105 + $i * 10)->format('Y-m-d H:i:s'),
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => "rate{$i}@test.com",
            'phone' => "+383 44 000 {$i}00",
        ]);
    }

    $this->postJson('/api/v1/reservations', [
        'vehicle_id' => $vehicle->id,
        'pickup_location_id' => $loc->id,
        'return_location_id' => $loc->id,
        'pickup_at' => now()->addDays(300)->format('Y-m-d H:i:s'),
        'return_at' => now()->addDays(305)->format('Y-m-d H:i:s'),
        'first_name' => 'Test',
        'last_name' => 'User',
        'email' => 'final@test.com',
        'phone' => '+383 44 999 000',
    ])->assertStatus(429);
});

it('rate limits public read API per IP', function () {
    for ($i = 0; $i < 60; $i++) {
        $this->getJson('/api/v1/vehicles');
    }

    $this->getJson('/api/v1/vehicles')->assertStatus(429);
});

it('includes correct rate limit headers on public API', function () {
    $response = $this->getJson('/api/v1/vehicles');

    $response->assertOk();
    expect($response->headers->has('X-RateLimit-Limit'))->toBeTrue();
});
