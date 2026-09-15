<?php

use App\Models\Location;

beforeEach(function () {
    $this->seed(\Database\Seeders\LocationSeeder::class);
});

it('returns all active locations', function () {
    $response = $this->getJson('/api/v1/locations');

    $response->assertOk()
        ->assertJsonCount(4, 'data')
        ->assertJsonStructure([
            'data' => [
                '*' => ['id', 'name', 'address', 'city', 'is_active', 'vehicles_count'],
            ],
        ]);
});

it('returns a single location', function () {
    $location = Location::first();

    $response = $this->getJson("/api/v1/locations/{$location->id}");

    $response->assertOk()
        ->assertJsonPath('data.id', $location->id)
        ->assertJsonPath('data.name', $location->name);
});

it('returns 404 for non-existent location', function () {
    $this->getJson('/api/v1/locations/9999')->assertNotFound();
});
