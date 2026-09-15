<?php

use App\Domain\Maintenance\MaintenanceService;
use App\Enums\MaintenanceStatus;
use App\Enums\MaintenanceType;
use App\Enums\VehicleStatus;
use App\Models\MaintenanceRecord;
use App\Models\Vehicle;

beforeEach(function () {
    $this->service = app(MaintenanceService::class);
    $this->vehicle = Vehicle::factory()->create(['status' => VehicleStatus::AVAILABLE]);
});

it('creates a maintenance record with unique code', function () {
    $record = $this->service->create([
        'vehicle_id' => $this->vehicle->id,
        'type' => MaintenanceType::OIL_CHANGE->value,
        'title' => 'Ndryshim vaji',
        'cost' => 80,
    ]);

    expect($record->maintenance_code)->toStartWith('MNT-' . now()->year . '-');
    expect($record->status)->toBe(MaintenanceStatus::SCHEDULED);
});

it('generates sequential codes', function () {
    $v2 = Vehicle::factory()->create();
    $r1 = $this->service->create(['vehicle_id' => $this->vehicle->id, 'type' => 'oil_change', 'title' => 'A']);
    $r2 = $this->service->create(['vehicle_id' => $v2->id, 'type' => 'tires', 'title' => 'B']);

    expect($r1->maintenance_code)->toBe('MNT-' . now()->year . '-0001');
    expect($r2->maintenance_code)->toBe('MNT-' . now()->year . '-0002');
});

it('blocks vehicle when blocks_vehicle is true', function () {
    $this->service->create([
        'vehicle_id' => $this->vehicle->id,
        'type' => 'service',
        'title' => 'Servis i madh',
        'blocks_vehicle' => true,
    ]);

    expect($this->vehicle->fresh()->status)->toBe(VehicleStatus::MAINTENANCE);
});

it('does not block an already rented vehicle', function () {
    $this->vehicle->update(['status' => VehicleStatus::RENTED]);

    $this->service->create([
        'vehicle_id' => $this->vehicle->id,
        'type' => 'service',
        'title' => 'Servis',
        'blocks_vehicle' => true,
    ]);

    expect($this->vehicle->fresh()->status)->toBe(VehicleStatus::RENTED);
});

it('releases vehicle when maintenance is completed', function () {
    $this->vehicle->update(['status' => VehicleStatus::MAINTENANCE]);

    $record = $this->service->create([
        'vehicle_id' => $this->vehicle->id,
        'type' => 'service',
        'title' => 'Servis',
        'blocks_vehicle' => true,
        'status' => MaintenanceStatus::IN_PROGRESS->value,
    ]);

    $this->service->update($record, [
        'status' => MaintenanceStatus::COMPLETED->value,
    ]);

    expect($this->vehicle->fresh()->status)->toBe(VehicleStatus::CLEANING);
});

it('rejects cancelling a completed maintenance', function () {
    $record = $this->service->create([
        'vehicle_id' => $this->vehicle->id,
        'type' => 'service',
        'title' => 'Servis',
        'status' => MaintenanceStatus::COMPLETED->value,
    ]);

    expect(fn () => $this->service->cancel($record))
        ->toThrow(RuntimeException::class);
});

it('rejects deleting an in_progress maintenance', function () {
    $record = $this->service->create([
        'vehicle_id' => $this->vehicle->id,
        'type' => 'service',
        'title' => 'Servis',
        'status' => MaintenanceStatus::IN_PROGRESS->value,
    ]);

    expect(fn () => $this->service->delete($record))
        ->toThrow(RuntimeException::class);
});

it('calculates days until next service', function () {
    $record = $this->service->create([
        'vehicle_id' => $this->vehicle->id,
        'type' => 'service',
        'title' => 'Servis',
        'next_service_at' => now()->addDays(20)->toDateString(),
    ]);

    expect($record->daysUntilNextService())->toBe(20);
});

it('detects overdue maintenance', function () {
    $record = $this->service->create([
        'vehicle_id' => $this->vehicle->id,
        'type' => 'service',
        'title' => 'Servis',
        'scheduled_at' => now()->subDays(3)->toDateString(),
        'status' => MaintenanceStatus::SCHEDULED->value,
    ]);

    expect($record->isOverdue())->toBeTrue();
});
