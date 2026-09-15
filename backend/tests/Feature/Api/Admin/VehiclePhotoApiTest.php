<?php

use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehiclePhoto;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
    $this->admin = User::factory()->create([
        'email' => 'admin@test.com',
        'password' => Hash::make('password123'),
        'is_active' => true,
    ]);
    $this->token = $this->admin->createToken('test')->plainTextToken;
    $this->headers = ['Authorization' => "Bearer {$this->token}"];
});

it('uploads photos for a vehicle', function () {
    $vehicle = Vehicle::factory()->create();

    $response = $this->withHeaders($this->headers)
        ->postJson("/api/v1/admin/vehicles/{$vehicle->id}/photos", [
            'photos' => [
                UploadedFile::fake()->image('car1.jpg', 1200, 800),
                UploadedFile::fake()->image('car2.jpg', 1200, 800),
            ],
        ]);

    $response->assertCreated()
        ->assertJsonCount(2, 'data');

    expect($vehicle->photos()->count())->toBe(2);
    expect($vehicle->photos()->where('is_primary', true)->count())->toBe(1);
});

it('validates max file size', function () {
    $vehicle = Vehicle::factory()->create();

    $response = $this->withHeaders($this->headers)
        ->postJson("/api/v1/admin/vehicles/{$vehicle->id}/photos", [
            'photos' => [UploadedFile::fake()->image('huge.jpg')->size(6000)],
        ]);

    $response->assertUnprocessable();
});

it('rejects non-image files', function () {
    $vehicle = Vehicle::factory()->create();

    $response = $this->withHeaders($this->headers)
        ->postJson("/api/v1/admin/vehicles/{$vehicle->id}/photos", [
            'photos' => [UploadedFile::fake()->create('doc.pdf', 100)],
        ]);

    $response->assertUnprocessable();
});

it('sets a photo as primary', function () {
    $vehicle = Vehicle::factory()->create();
    $first = VehiclePhoto::factory()->create([
        'vehicle_id' => $vehicle->id,
        'is_primary' => true,
        'sort_order' => 0,
    ]);
    $second = VehiclePhoto::factory()->create([
        'vehicle_id' => $vehicle->id,
        'is_primary' => false,
        'sort_order' => 1,
    ]);

    $response = $this->withHeaders($this->headers)
        ->patchJson("/api/v1/admin/vehicles/{$vehicle->id}/photos/{$second->id}/primary");

    $response->assertOk();
    expect($first->fresh()->is_primary)->toBeFalse();
    expect($second->fresh()->is_primary)->toBeTrue();
});

it('deletes a photo', function () {
    $vehicle = Vehicle::factory()->create();
    $photo = VehiclePhoto::factory()->create([
        'vehicle_id' => $vehicle->id,
        'path' => 'vehicles/1/test.jpg',
        'is_primary' => false,
    ]);

    $response = $this->withHeaders($this->headers)
        ->deleteJson("/api/v1/admin/vehicles/{$vehicle->id}/photos/{$photo->id}");

    $response->assertOk();
    expect($vehicle->photos()->count())->toBe(0);
});

it('promotes next photo to primary when primary is deleted', function () {
    $vehicle = Vehicle::factory()->create();
    $primary = VehiclePhoto::factory()->create([
        'vehicle_id' => $vehicle->id,
        'is_primary' => true,
        'sort_order' => 0,
    ]);
    $second = VehiclePhoto::factory()->create([
        'vehicle_id' => $vehicle->id,
        'is_primary' => false,
        'sort_order' => 1,
    ]);

    $this->withHeaders($this->headers)
        ->deleteJson("/api/v1/admin/vehicles/{$vehicle->id}/photos/{$primary->id}")
        ->assertOk();

    expect($second->fresh()->is_primary)->toBeTrue();
});

it('requires authentication for upload', function () {
    $vehicle = Vehicle::factory()->create();
    $this->postJson("/api/v1/admin/vehicles/{$vehicle->id}/photos")->assertUnauthorized();
});
