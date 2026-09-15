<?php

use App\Enums\PaymentStatus;
use App\Enums\RentalStatus;
use App\Enums\VehicleStatus;
use App\Models\Customer;
use App\Models\Location;
use App\Models\MaintenanceRecord;
use App\Models\Payment;
use App\Models\Rental;
use App\Models\Reservation;
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
    $this->getJson('/api/v1/admin/reports/dashboard')->assertUnauthorized();
});

it('returns dashboard KPIs', function () {
    Vehicle::factory()->count(3)->create(['status' => VehicleStatus::AVAILABLE]);

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/reports/dashboard');

    $response->assertOk()
        ->assertJsonStructure([
            'data' => [
                'revenue' => ['total_revenue', 'rental_revenue', 'deposits_received', 'net_received'],
                'fleet' => ['total_vehicles', 'utilization_rate', 'rented_days'],
                'rentals' => ['total_reservations', 'total_rentals', 'average_duration_days', 'average_value'],
                'customers' => ['total_customers', 'new_customers', 'returning_customers'],
                'financial' => ['maintenance_cost', 'damage_cost', 'outstanding_payments'],
            ],
            'range' => ['from', 'to'],
        ]);
});

it('calculates total revenue correctly', function () {
    $rental = Rental::factory()->create();

    Payment::factory()->create([
        'payable_type' => Rental::class,
        'payable_id' => $rental->id,
        'customer_id' => $rental->customer_id,
        'type' => 'rental_payment',
        'amount' => 500,
        'status' => PaymentStatus::COMPLETED,
        'paid_at' => now()->subDays(2),
    ]);
    Payment::factory()->create([
        'payable_type' => Rental::class,
        'payable_id' => $rental->id,
        'customer_id' => $rental->customer_id,
        'type' => 'deposit_received',
        'amount' => 300,
        'status' => PaymentStatus::COMPLETED,
        'paid_at' => now()->subDay(),
    ]);

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/reports/dashboard');

    $response->assertOk()
        ->assertJsonPath('data.revenue.rental_revenue', 500)
        ->assertJsonPath('data.revenue.deposits_received', 300)
        ->assertJsonPath('data.revenue.total_revenue', 800);
});

it('calculates fleet utilization', function () {
    Vehicle::factory()->count(4)->create(['status' => VehicleStatus::AVAILABLE]);

    $vehicle = Vehicle::where('status', 'available')->first();

    Rental::factory()->create([
        'vehicle_id' => $vehicle->id,
        'planned_pickup_at' => now()->subDays(5),
        'planned_return_at' => now()->subDays(2),
        'status' => RentalStatus::COMPLETED,
        'created_at' => now()->subDays(5),
    ]);

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/reports/dashboard?from=' . now()->subDays(6)->toDateString() . '&to=' . now()->toDateString());

    $response->assertOk();
    expect($response->json('data.fleet.total_vehicles'))->toBe(4);
    expect($response->json('data.fleet.rented_days'))->toBeGreaterThan(0);
});

it('calculates cancellation rate', function () {
    Reservation::factory()->count(8)->create(['status' => 'completed']);
    Reservation::factory()->count(2)->create(['status' => 'cancelled']);

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/reports/dashboard');

    $response->assertOk();
    expect($response->json('data.rentals.cancellation_rate'))->toBe(20);
});

it('returns revenue chart by day', function () {
    $rental = Rental::factory()->create();

    Payment::factory()->count(3)->create([
        'payable_type' => Rental::class,
        'payable_id' => $rental->id,
        'customer_id' => $rental->customer_id,
        'type' => 'rental_payment',
        'amount' => 100,
        'status' => PaymentStatus::COMPLETED,
        'paid_at' => now()->subDays(2),
    ]);

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/reports/revenue?group_by=day');

    $response->assertOk()
        ->assertJsonStructure([
            'data' => ['*' => ['period', 'revenue', 'payment_count']],
            'group_by',
        ]);
});

it('returns vehicle performance', function () {
    $v1 = Vehicle::factory()->create();
    $v2 = Vehicle::factory()->create();

    Rental::factory()->create([
        'vehicle_id' => $v1->id,
        'total_amount' => 500,
        'status' => RentalStatus::COMPLETED,
    ]);

    Rental::factory()->create([
        'vehicle_id' => $v2->id,
        'total_amount' => 300,
        'status' => RentalStatus::COMPLETED,
    ]);

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/reports/vehicles');

    $response->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonStructure([
            'data' => ['*' => ['vehicle_id', 'full_name', 'rentals_count', 'revenue', 'utilization_rate']],
        ]);

    // Sortim desc — v1 para v2
    expect($response->json('data.0.vehicle_id'))->toBe($v1->id);
});

it('returns location performance', function () {
    $loc = Location::factory()->create(['is_active' => true]);
    Reservation::factory()->count(3)->create([
        'pickup_location_id' => $loc->id,
        'total' => 200,
    ]);

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/reports/locations');

    $response->assertOk()
        ->assertJsonStructure([
            'data' => ['*' => ['location_id', 'name', 'reservations_count', 'revenue']],
        ]);
});

it('counts maintenance cost in financial metrics', function () {
    MaintenanceRecord::factory()->create([
        'performed_at' => now()->subDays(3),
        'status' => 'completed',
        'cost' => 250,
    ]);

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/reports/dashboard');

    $response->assertOk();
expect($response->json('data.financial.maintenance_cost'))->toBe(250);});

it('accepts custom date range', function () {
    $from = now()->subDays(90)->toDateString();
    $to = now()->toDateString();

    $response = $this->withHeaders($this->headers)
        ->getJson("/api/v1/admin/reports/dashboard?from={$from}&to={$to}");

    $response->assertOk()
        ->assertJsonPath('range.from', $from)
        ->assertJsonPath('range.to', $to);
});
