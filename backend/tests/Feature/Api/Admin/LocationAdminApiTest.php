<?php

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
    $this->getJson('/api/v1/admin/locations')->assertUnauthorized();
    $this->postJson('/api/v1/admin/locations', [])->assertUnauthorized();
});

it('lists all locations including inactive', function () {
    Location::factory()->count(3)->create(['is_active' => true]);
    Location::factory()->create(['is_active' => false]);

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/locations');

    $response->assertOk()->assertJsonCount(4, 'data');
});

it('creates a location', function () {
    $payload = [
        'name' => 'Gjakova',
        'address' => 'Rr. Nëna Terezë 5',
        'city' => 'Gjakova',
        'phone' => '+383 39 222 111',
        'email' => 'gjakova@test.com',
        'opening_hours' => ['mon_fri' => '08:00-20:00'],
        'is_active' => true,
    ];

    $response = $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/locations', $payload);

    $response->assertCreated()
        ->assertJsonPath('data.name', 'Gjakova');

    $this->assertDatabaseHas('locations', ['name' => 'Gjakova']);
});

it('validates required fields on create', function () {
    $response = $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/locations', []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'address', 'city']);
});

it('rejects duplicate name on create', function () {
    Location::factory()->create(['name' => 'Prizren']);

    $response = $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/locations', [
            'name' => 'Prizren',
            'address' => 'X',
            'city' => 'Prizren',
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['name']);
});

it('updates a location', function () {
    $location = Location::factory()->create(['name' => 'Old Name']);

    $response = $this->withHeaders($this->headers)
        ->putJson("/api/v1/admin/locations/{$location->id}", [
            'name' => 'New Name',
            'address' => $location->address,
            'city' => $location->city,
        ]);

    $response->assertOk()->assertJsonPath('data.name', 'New Name');
    expect($location->fresh()->name)->toBe('New Name');
});

it('allows updating a location keeping its own name', function () {
    $location = Location::factory()->create(['name' => 'Same Name']);

    $response = $this->withHeaders($this->headers)
        ->putJson("/api/v1/admin/locations/{$location->id}", [
            'name' => 'Same Name',
            'address' => $location->address,
            'city' => $location->city,
        ]);

    $response->assertOk();
});

it('deletes a location without vehicles', function () {
    $location = Location::factory()->create();

    $response = $this->withHeaders($this->headers)
        ->deleteJson("/api/v1/admin/locations/{$location->id}");

    $response->assertOk();
    $this->assertDatabaseMissing('locations', ['id' => $location->id]);
});

it('refuses to delete a location with vehicles', function () {
    $location = Location::factory()->create();
    Vehicle::factory()->create(['current_location_id' => $location->id]);

    $response = $this->withHeaders($this->headers)
        ->deleteJson("/api/v1/admin/locations/{$location->id}");

    $response->assertStatus(409);
    $this->assertDatabaseHas('locations', ['id' => $location->id]);
});
