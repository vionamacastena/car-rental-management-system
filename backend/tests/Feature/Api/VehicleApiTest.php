<?php

use App\Models\Vehicle;

beforeEach(function () {
    $this->seed([
        \Database\Seeders\LocationSeeder::class,
        \Database\Seeders\VehicleSeeder::class,
    ]);
});

it('returns paginated available vehicles', function () {
    $response = $this->getJson('/api/v1/vehicles');

    $response->assertOk()
        ->assertJsonCount(6, 'data')
        ->assertJsonPath('meta.total', 6)
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'id', 'brand', 'model', 'full_name', 'year',
                    'fuel_type' => ['value', 'label'],
                    'transmission' => ['value', 'label'],
                    'status' => ['value', 'label'],
                    'daily_price', 'photos', 'primary_photo',
                ],
            ],
            'meta' => ['total', 'per_page', 'current_page', 'last_page'],
        ]);
});

it('filters by fuel_type', function () {
    $response = $this->getJson('/api/v1/vehicles?fuel_type=diesel');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(3);
});

it('filters by transmission', function () {
    $response = $this->getJson('/api/v1/vehicles?transmission=manual');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(2);
});

it('filters by price_max', function () {
    $response = $this->getJson('/api/v1/vehicles?price_max=40');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(2);
});

it('sorts by daily_price desc', function () {
    $response = $this->getJson('/api/v1/vehicles?sort_by=daily_price&sort_dir=desc');

    $response->assertOk();
    $prices = collect($response->json('data'))->pluck('daily_price')->all();
    expect($prices)->toBe([50, 50, 50, 42, 38, 35]);
});

it('sorts by daily_price asc', function () {
    $response = $this->getJson('/api/v1/vehicles?sort_by=daily_price&sort_dir=asc');

    $response->assertOk();
    $prices = collect($response->json('data'))->pluck('daily_price')->all();
    expect($prices)->toBe([35, 38, 42, 50, 50, 50]);
});

it('hides vin for public requests', function () {
    $response = $this->getJson('/api/v1/vehicles/1');

    $response->assertOk();
    expect($response->json('data'))->not->toHaveKey('vin');
});

it('shows full details for a vehicle', function () {
    $vehicle = Vehicle::first();

    $response = $this->getJson("/api/v1/vehicles/{$vehicle->id}");

    $response->assertOk()
        ->assertJsonPath('data.id', $vehicle->id)
        ->assertJsonPath('data.full_name', 'BMW 320d');
});
