<?php

use App\Enums\FuelType;
use App\Enums\Transmission;
use App\Enums\VehicleStatus;
use App\Models\Location;
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
    $this->getJson('/api/v1/admin/vehicles')->assertUnauthorized();
});

it('lists all vehicles including non-available', function () {
    Vehicle::factory()->count(3)->create();
    Vehicle::factory()->create(['status' => VehicleStatus::MAINTENANCE->value]);

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/vehicles');

    $response->assertOk()->assertJsonCount(4, 'data');
});

it('searches by brand, model, license plate', function () {
    Vehicle::factory()->create(['brand' => 'BMW', 'model' => '320d']);
    Vehicle::factory()->create(['brand' => 'Audi', 'model' => 'A4']);

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/vehicles?search=BMW');

    $response->assertOk()->assertJsonCount(1, 'data');
});

it('filters by status', function () {
    Vehicle::factory()->count(2)->create(['status' => VehicleStatus::AVAILABLE->value]);
    Vehicle::factory()->create(['status' => VehicleStatus::MAINTENANCE->value]);

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/vehicles?status=maintenance');

    $response->assertOk()->assertJsonCount(1, 'data');
});

it('creates a vehicle', function () {
    $location = Location::factory()->create();

    $response = $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/vehicles', [
            'brand' => 'Renault',
            'model' => 'Clio',
            'year' => 2023,
            'license_plate' => '01-CLIO-23',
            'mileage' => 5000,
            'fuel_type' => FuelType::PETROL->value,
            'transmission' => Transmission::MANUAL->value,
            'seats' => 5,
            'current_location_id' => $location->id,
            'status' => VehicleStatus::AVAILABLE->value,
            'daily_price' => 30,
            'features' => ['Bluetooth', 'AC'],
        ]);

    $response->assertCreated()->assertJsonPath('data.full_name', 'Renault Clio');
    $this->assertDatabaseHas('vehicles', ['license_plate' => '01-CLIO-23']);
});

it('validates required fields on create', function () {
    $response = $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/vehicles', []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['brand', 'model', 'year', 'license_plate', 'fuel_type']);
});

it('rejects duplicate license_plate', function () {
    Vehicle::factory()->create(['license_plate' => '01-DUP-01']);

    $response = $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/vehicles', [
            'brand' => 'X', 'model' => 'Y', 'year' => 2024,
            'license_plate' => '01-DUP-01', 'mileage' => 0,
            'fuel_type' => 'petrol', 'transmission' => 'manual',
            'seats' => 5, 'status' => 'available', 'daily_price' => 10,
        ]);

    $response->assertUnprocessable()->assertJsonValidationErrors(['license_plate']);
});

it('updates a vehicle', function () {
    $vehicle = Vehicle::factory()->create(['daily_price' => 30]);

    $response = $this->withHeaders($this->headers)
        ->putJson("/api/v1/admin/vehicles/{$vehicle->id}", [
            'brand' => $vehicle->brand,
            'model' => $vehicle->model,
            'year' => $vehicle->year,
            'license_plate' => $vehicle->license_plate,
            'mileage' => $vehicle->mileage,
            'fuel_type' => $vehicle->fuel_type->value,
            'transmission' => $vehicle->transmission->value,
            'seats' => $vehicle->seats,
            'status' => $vehicle->status->value,
            'daily_price' => 55,
        ]);

    $response->assertOk();
    expect($vehicle->fresh()->daily_price)->toBe('55.00');
});

it('updates status via patch', function () {
    $vehicle = Vehicle::factory()->create(['status' => VehicleStatus::AVAILABLE->value]);

    $response = $this->withHeaders($this->headers)
        ->patchJson("/api/v1/admin/vehicles/{$vehicle->id}/status", [
            'status' => VehicleStatus::MAINTENANCE->value,
        ]);

    $response->assertOk();
    expect($vehicle->fresh()->status)->toBe(VehicleStatus::MAINTENANCE);
});

it('deletes an available vehicle', function () {
    $vehicle = Vehicle::factory()->create(['status' => VehicleStatus::AVAILABLE->value]);

    $response = $this->withHeaders($this->headers)
        ->deleteJson("/api/v1/admin/vehicles/{$vehicle->id}");

    $response->assertOk();
    $this->assertDatabaseMissing('vehicles', ['id' => $vehicle->id]);
});

it('refuses to delete a rented vehicle', function () {
    $vehicle = Vehicle::factory()->create(['status' => VehicleStatus::RENTED->value]);

    $response = $this->withHeaders($this->headers)
        ->deleteJson("/api/v1/admin/vehicles/{$vehicle->id}");

    $response->assertStatus(409);
    $this->assertDatabaseHas('vehicles', ['id' => $vehicle->id]);
});
