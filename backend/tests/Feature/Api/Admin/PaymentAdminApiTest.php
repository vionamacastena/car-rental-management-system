<?php

use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\Rental;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

beforeEach(function () {
    $this->admin = User::factory()->create([
        'email' => 'admin@test.com',
        'password' => Hash::make('password123'),
        'is_active' => true,
    ]);
    $this->token = $this->admin->createToken('test')->plainTextToken;
    $this->headers = ['Authorization' => "Bearer {$this->token}"];
    $this->rental = Rental::factory()->create();
});

it('requires authentication', function () {
    $this->getJson('/api/v1/admin/payments')->assertUnauthorized();
});

it('lists payments', function () {
    Payment::factory()->count(3)->create();

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/payments');

    $response->assertOk()->assertJsonCount(3, 'data');
});

it('registers a rental payment', function () {
    $response = $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/payments', [
            'payable_type' => 'rental',
            'payable_id' => $this->rental->id,
            'type' => 'rental_payment',
            'method' => 'cash',
            'amount' => 250,
            'notes' => 'Pagesë në dorëzim',
        ]);

    $response->assertCreated()
        ->assertJsonPath('data.type.value', 'rental_payment')
        ->assertJsonPath('data.amount', 250);

    $this->assertDatabaseHas('payments', ['amount' => 250]);
});

it('registers a deposit', function () {
    $response = $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/payments', [
            'payable_type' => 'rental',
            'payable_id' => $this->rental->id,
            'type' => 'deposit_received',
            'method' => 'card',
            'amount' => 300,
        ]);

    $response->assertCreated();
    expect($response->json('data.payment_code'))->toStartWith('PAY-' . now()->year . '-');
});

it('validates required fields on store', function () {
    $response = $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/payments', []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['payable_type', 'payable_id', 'type', 'method', 'amount']);
});

it('rejects invalid payment type', function () {
    $response = $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/payments', [
            'payable_type' => 'rental',
            'payable_id' => $this->rental->id,
            'type' => 'invalid_type',
            'method' => 'cash',
            'amount' => 100,
        ]);

    $response->assertUnprocessable()->assertJsonValidationErrors(['type']);
});

it('refunds a payment', function () {
    $payment = Payment::factory()->create([
        'payable_type' => Rental::class,
        'payable_id' => $this->rental->id,
        'customer_id' => $this->rental->customer_id,
        'amount' => 300,
        'refunded_amount' => 0,
        'type' => 'deposit_received',
        'status' => PaymentStatus::COMPLETED,
    ]);

    $response = $this->withHeaders($this->headers)
        ->postJson("/api/v1/admin/payments/{$payment->id}/refund", [
            'amount' => 150,
            'notes' => 'Rimbursim i pjesshëm',
        ]);

    $response->assertOk()
        ->assertJsonPath('data.type.value', 'deposit_refund')
        ->assertJsonPath('data.amount', 150);

    expect($payment->fresh()->status)->toBe(PaymentStatus::PARTIALLY_REFUNDED);
});

it('rejects refund exceeding amount', function () {
    $payment = Payment::factory()->create([
        'payable_type' => Rental::class,
        'payable_id' => $this->rental->id,
        'amount' => 100,
        'status' => PaymentStatus::COMPLETED,
    ]);

    $response = $this->withHeaders($this->headers)
        ->postJson("/api/v1/admin/payments/{$payment->id}/refund", [
            'amount' => 500,
        ]);

    $response->assertStatus(409);
});

it('returns summary for rental', function () {
    Payment::factory()->create([
        'payable_type' => Rental::class,
        'payable_id' => $this->rental->id,
        'customer_id' => $this->rental->customer_id,
        'amount' => 250,
        'type' => 'rental_payment',
    ]);
    Payment::factory()->create([
        'payable_type' => Rental::class,
        'payable_id' => $this->rental->id,
        'customer_id' => $this->rental->customer_id,
        'amount' => 300,
        'type' => 'deposit_received',
    ]);

    $response = $this->withHeaders($this->headers)
        ->getJson("/api/v1/admin/payments/summary?payable_type=rental&payable_id={$this->rental->id}");

    $response->assertOk()
        ->assertJsonPath('data.total_paid', 550)
        ->assertJsonPath('data.net_received', 550);
});

it('filters payments by type', function () {
    Payment::factory()->create(['type' => 'rental_payment']);
    Payment::factory()->create(['type' => 'deposit_received']);
    Payment::factory()->create(['type' => 'extra_charge']);

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/payments?type=deposit_received');

    $response->assertOk()->assertJsonCount(1, 'data');
});
