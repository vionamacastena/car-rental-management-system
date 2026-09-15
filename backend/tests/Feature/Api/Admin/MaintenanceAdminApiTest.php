<?php

use App\Enums\MaintenanceStatus;
use App\Enums\VehicleStatus;
use App\Models\MaintenanceRecord;
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
    $this->vehicle = Vehicle::factory()->create(['status' => VehicleStatus::AVAILABLE]);
});

it('requires authentication', function () {
    $this->getJson('/api/v1/admin/maintenance')->assertUnauthorized();
});

it('lists maintenance records', function () {
    MaintenanceRecord::factory()->count(3)->create();

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/maintenance');

    $response->assertOk()->assertJsonCount(3, 'data');
});

it('creates a maintenance record', function () {
    $response = $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/maintenance', [
            'vehicle_id' => $this->vehicle->id,
            'type' => 'oil_change',
            'title' => 'Ndryshim vaji',
            'cost' => 80,
        ]);

    $response->assertCreated()
        ->assertJsonPath('data.type.value', 'oil_change')
        ->assertJsonPath('data.status.value', 'scheduled');
});

it('validates required fields', function () {
    $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/maintenance', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['vehicle_id', 'type', 'title']);
});

it('updates a maintenance record', function () {
    $record = MaintenanceRecord::factory()->create([
        'vehicle_id' => $this->vehicle->id,
        'status' => MaintenanceStatus::SCHEDULED,
    ]);

    $response = $this->withHeaders($this->headers)
        ->putJson("/api/v1/admin/maintenance/{$record->id}", [
            'title' => 'Updated',
            'cost' => 150,
        ]);

    $response->assertOk();
    expect($record->fresh()->title)->toBe('Updated');
    expect((float) $record->fresh()->cost)->toBe(150.0);
});

it('cancels a scheduled maintenance', function () {
    $record = MaintenanceRecord::factory()->create([
        'status' => MaintenanceStatus::SCHEDULED,
    ]);

    $response = $this->withHeaders($this->headers)
        ->postJson("/api/v1/admin/maintenance/{$record->id}/cancel");

    $response->assertOk()
        ->assertJsonPath('data.status.value', 'cancelled');
});

it('filters by status', function () {
    MaintenanceRecord::factory()->count(2)->create(['status' => MaintenanceStatus::SCHEDULED]);
    MaintenanceRecord::factory()->create(['status' => MaintenanceStatus::COMPLETED]);

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/maintenance?status=completed');

    $response->assertOk()->assertJsonCount(1, 'data');
});

it('filters overdue records', function () {
    MaintenanceRecord::factory()->create([
        'status' => MaintenanceStatus::SCHEDULED,
        'scheduled_at' => now()->subDays(3),
    ]);
    MaintenanceRecord::factory()->create([
        'status' => MaintenanceStatus::SCHEDULED,
        'scheduled_at' => now()->addDays(5),
    ]);

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/maintenance?overdue=1');

    $response->assertOk()->assertJsonCount(1, 'data');
});

it('refuses to cancel a completed maintenance', function () {
    $record = MaintenanceRecord::factory()->create([
        'status' => MaintenanceStatus::COMPLETED,
    ]);

    $response = $this->withHeaders($this->headers)
        ->postJson("/api/v1/admin/maintenance/{$record->id}/cancel");

    $response->assertStatus(409);
});
