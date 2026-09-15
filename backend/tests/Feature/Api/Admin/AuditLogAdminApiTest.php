<?php

use App\Models\AuditLog;
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
    $this->getJson('/api/v1/admin/audit-logs')->assertUnauthorized();
});

it('lists audit logs', function () {
    // Krijo disa regjistrime
    $this->actingAs($this->admin);
    Vehicle::factory()->count(3)->create();

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/audit-logs');

    $response->assertOk()
        ->assertJsonStructure([
            'data' => [
                '*' => ['id', 'action', 'entity', 'user', 'created_at'],
            ],
        ]);
});

it('filters audit logs by action', function () {
    $this->actingAs($this->admin);
    $v = Vehicle::factory()->create();
    $v->update(['daily_price' => 99]);

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/audit-logs?action=updated');

    $response->assertOk();

    $actions = collect($response->json('data'))->pluck('action')->unique()->all();
    expect($actions)->toBe(['updated']);
});

it('filters by user', function () {
    $this->actingAs($this->admin);
    Vehicle::factory()->create();

    $other = User::factory()->create(['is_active' => true]);
    $this->actingAs($other);
    Vehicle::factory()->create();

    $response = $this->withHeaders($this->headers)
        ->getJson("/api/v1/admin/audit-logs?user_id={$this->admin->id}");

    $response->assertOk();
    $userIds = collect($response->json('data'))->pluck('user.id')->unique()->all();
    expect($userIds)->toBe([$this->admin->id]);
});

it('returns unique actions list', function () {
    $this->actingAs($this->admin);
    Vehicle::factory()->create();
    Vehicle::factory()->create()->update(['daily_price' => 77]);

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/audit-logs/actions');

    $response->assertOk();
    expect($response->json('data'))->toContain('created', 'updated');
});

it('shows a single audit log', function () {
    $this->actingAs($this->admin);
    Vehicle::factory()->create();

    $log = AuditLog::first();

    $response = $this->withHeaders($this->headers)
        ->getJson("/api/v1/admin/audit-logs/{$log->id}");

    $response->assertOk()
        ->assertJsonPath('data.id', $log->id)
        ->assertJsonStructure([
            'data' => ['entity', 'user', 'old_values', 'new_values', 'changed_fields'],
        ]);
});
