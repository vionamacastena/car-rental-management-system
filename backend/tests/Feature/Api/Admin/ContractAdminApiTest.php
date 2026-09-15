<?php

use App\Enums\ContractStatus;
use App\Enums\RentalStatus;
use App\Enums\VehicleStatus;
use App\Models\Contract;
use App\Models\Rental;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('local');

    $this->admin = User::factory()->create([
        'email' => 'admin@test.com',
        'password' => Hash::make('password123'),
        'is_active' => true,
    ]);
    $this->token = $this->admin->createToken('test')->plainTextToken;
    $this->headers = ['Authorization' => "Bearer {$this->token}"];

    $this->vehicle = Vehicle::factory()->create([
        'status' => VehicleStatus::AVAILABLE->value,
        'daily_price' => 50,
    ]);
    $this->rental = Rental::factory()->create([
        'vehicle_id' => $this->vehicle->id,
        'status' => RentalStatus::PENDING_CHECKOUT,
        'base_amount' => 250,
        'total_amount' => 250,
        'planned_pickup_at' => now()->addDays(2),
        'planned_return_at' => now()->addDays(7),
    ]);
});

it('requires authentication', function () {
    $this->getJson('/api/v1/admin/contracts')->assertUnauthorized();
});

it('lists contracts', function () {
    Contract::factory()->count(3)->create();

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/contracts');

    $response->assertOk()->assertJsonCount(3, 'data');
});

it('generates a contract from a rental', function () {
    $response = $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/contracts', [
            'rental_id' => $this->rental->id,
        ]);

    $response->assertCreated()
        ->assertJsonPath('data.status.value', 'draft');

    $contract = Contract::first();
    expect($contract->contract_number)->toStartWith('CON-' . now()->year . '-');
    expect($contract->terms_snapshot)->toHaveKey('mileage_policy');
    expect($contract->terms_snapshot)->toHaveKey('insurance');
    expect($contract->pdf_path)->not->toBeNull();
});

it('returns existing contract on duplicate generation', function () {
    $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/contracts', ['rental_id' => $this->rental->id])
        ->assertCreated();

    $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/contracts', ['rental_id' => $this->rental->id])
        ->assertStatus(200);

    expect(Contract::count())->toBe(1);
});

it('validates rental_id', function () {
    $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/contracts', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['rental_id']);
});

it('downloads the PDF', function () {
    $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/contracts', ['rental_id' => $this->rental->id])
        ->assertCreated();

    $contract = Contract::first();

    $response = $this->withHeaders($this->headers)
        ->get("/api/v1/admin/contracts/{$contract->id}/pdf");

    $response->assertOk();
    expect($response->headers->get('content-type'))->toBe('application/pdf');
});

it('shows contract with relations', function () {
    $contract = Contract::factory()->create(['rental_id' => $this->rental->id]);

    $response = $this->withHeaders($this->headers)
        ->getJson("/api/v1/admin/contracts/{$contract->id}");

    $response->assertOk()
        ->assertJsonPath('data.id', $contract->id)
        ->assertJsonStructure([
            'data' => ['customer', 'vehicle', 'terms_snapshot', 'signatures'],
        ]);
});

it('regenerates the PDF', function () {
    $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/contracts', ['rental_id' => $this->rental->id])
        ->assertCreated();

    $contract = Contract::first();

    $this->withHeaders($this->headers)
        ->postJson("/api/v1/admin/contracts/{$contract->id}/regenerate")
        ->assertOk();

    expect(Storage::disk('local')->exists($contract->fresh()->pdf_path))->toBeTrue();
});

it('filters contracts by status', function () {
    Contract::factory()->create(['status' => ContractStatus::DRAFT]);
    Contract::factory()->create(['status' => ContractStatus::SIGNED]);

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/contracts?status=signed');

    $response->assertOk()->assertJsonCount(1, 'data');
});
