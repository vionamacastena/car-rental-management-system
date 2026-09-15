<?php

use App\Domain\Audit\AuditService;
use App\Models\AuditLog;
use App\Models\Customer;
use App\Models\User;
use App\Models\Vehicle;

beforeEach(function () {
    $this->admin = User::factory()->create([
        'email' => 'admin@test.com',
        'name' => 'Admin Test',
        'is_active' => true,
    ]);
    $this->actingAs($this->admin);
});

it('logs a created event automatically', function () {
    $vehicle = Vehicle::factory()->create([
        'brand' => 'BMW',
        'model' => 'X5',
        'license_plate' => '01-X5-TEST',
    ]);

    expect(AuditLog::count())->toBe(1);

    $log = AuditLog::first();
    expect($log->action)->toBe('created');
    expect($log->entity_type)->toBe(Vehicle::class);
    expect($log->entity_id)->toBe($vehicle->id);
    expect($log->user_id)->toBe($this->admin->id);
    expect($log->user_name)->toBe('Admin Test');
});

it('builds readable entity label for vehicles', function () {
    Vehicle::factory()->create([
        'brand' => 'BMW',
        'model' => '320d',
        'license_plate' => '01-320-DA',
    ]);

    $log = AuditLog::first();
    expect($log->entity_label)->toBe('BMW 320d (01-320-DA)');
});

it('logs an updated event with old/new values', function () {
    $vehicle = Vehicle::factory()->create(['daily_price' => 50]);

    AuditLog::query()->delete();

    $vehicle->update(['daily_price' => 80]);

    expect(AuditLog::count())->toBe(1);

    $log = AuditLog::first();
    expect($log->action)->toBe('updated');
    expect((float) $log->old_values['daily_price'])->toBe(50.0);
    expect((float) $log->new_values['daily_price'])->toBe(80.0);
});

it('logs a deleted event', function () {
    $customer = Customer::factory()->create();

    AuditLog::query()->delete();

    $customer->delete();

    $log = AuditLog::first();
    expect($log->action)->toBe('deleted');
    expect($log->entity_id)->toBe($customer->id);
});

it('computes changed fields correctly', function () {
    $vehicle = Vehicle::factory()->create(['daily_price' => 50]);
    AuditLog::query()->delete();

    $vehicle->update(['daily_price' => 80]);

    $log = AuditLog::first();
    $changes = $log->changedFields();

    expect($changes)->toHaveKey('daily_price');
    expect((float) $changes['daily_price']['old'])->toBe(50.0);
    expect((float) $changes['daily_price']['new'])->toBe(80.0);
});

it('ignores updates with no actual changes', function () {
    $vehicle = Vehicle::factory()->create();
    AuditLog::query()->delete();

    $vehicle->update([]); // no changes

    expect(AuditLog::count())->toBe(0);
});

it('logs custom action manually', function () {
    $vehicle = Vehicle::factory()->create();
    AuditLog::query()->delete();

    app(AuditService::class)->log(
        action: 'status_changed',
        entity: $vehicle,
        newValues: ['status' => 'maintenance'],
        description: 'Ndryshoi në maintenance',
    );

    $log = AuditLog::first();
    expect($log->action)->toBe('status_changed');
    expect($log->description)->toBe('Ndryshoi në maintenance');
});
