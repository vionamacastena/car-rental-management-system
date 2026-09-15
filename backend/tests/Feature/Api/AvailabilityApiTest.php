<?php

use App\Models\Location;

beforeEach(function () {
    $this->seed([
        \Database\Seeders\LocationSeeder::class,
        \Database\Seeders\VehicleSeeder::class,
    ]);
});

it('returns available vehicles', function () {
    $response = $this->getJson('/api/v1/availability');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(6);
});

it('filters by pickup location', function () {
    $airport = Location::where('name', 'Pristina Airport')->first();

    $response = $this->getJson("/api/v1/availability?pickup_location_id={$airport->id}");

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(2); // Audi + Toyota
});

it('validates return_at is after pickup_at', function () {
    $response = $this->getJson('/api/v1/availability?pickup_at=2026-10-10&return_at=2026-10-05');

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['return_at']);
});

it('rejects non-existent location', function () {
    $response = $this->getJson('/api/v1/availability?pickup_location_id=9999');

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['pickup_location_id']);
});
