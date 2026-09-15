<?php

use App\Models\Customer;
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
});

it('requires authentication', function () {
    $this->getJson('/api/v1/admin/customers')->assertUnauthorized();
});

it('lists all customers', function () {
    Customer::factory()->count(5)->create();

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/customers');

    $response->assertOk()->assertJsonCount(5, 'data');
});

it('searches customers by name, email, phone', function () {
    Customer::factory()->create(['first_name' => 'Arben', 'last_name' => 'Krasniqi']);
    Customer::factory()->create(['first_name' => 'Blerina', 'last_name' => 'Berisha']);

    $r1 = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/customers?search=arben');
    $r1->assertOk()->assertJsonCount(1, 'data');

    $r2 = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/customers?search=BLERINA');
    $r2->assertOk()->assertJsonCount(1, 'data');
});

it('creates a customer', function () {
    $response = $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/customers', [
            'first_name' => 'Ardit',
            'last_name' => 'Morina',
            'email' => 'ardit@example.com',
            'phone' => '+383 44 123 456',
            'city' => 'Prishtina',
            'country' => 'Kosovo',
        ]);

    $response->assertCreated()
        ->assertJsonPath('data.full_name', 'Ardit Morina');

    $this->assertDatabaseHas('customers', ['email' => 'ardit@example.com']);
});

it('validates required fields', function () {
    $response = $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/customers', []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['first_name', 'last_name', 'email', 'phone']);
});

it('updates a customer', function () {
    $customer = Customer::factory()->create(['first_name' => 'Old']);

    $response = $this->withHeaders($this->headers)
        ->putJson("/api/v1/admin/customers/{$customer->id}", [
            'first_name' => 'New',
            'last_name' => $customer->last_name,
            'email' => $customer->email,
            'phone' => $customer->phone,
        ]);

    $response->assertOk()->assertJsonPath('data.first_name', 'New');
});

it('deletes a customer', function () {
    $customer = Customer::factory()->create();

    $response = $this->withHeaders($this->headers)
        ->deleteJson("/api/v1/admin/customers/{$customer->id}");

    $response->assertOk();
    $this->assertDatabaseMissing('customers', ['id' => $customer->id]);
});

it('findOrCreateFromBooking dedupes by email + phone', function () {
    Customer::factory()->create([
        'email' => 'test@example.com',
        'phone' => '+383 44 111 222',
        'first_name' => 'Old',
    ]);

    $found = Customer::findOrCreateFromBooking([
        'first_name' => 'Updated',
        'last_name' => 'Name',
        'email' => 'TEST@example.com', // case insensitive
        'phone' => '+383 44 111 222',
    ]);

    expect(Customer::count())->toBe(1);
    expect($found->first_name)->toBe('Updated');
});

it('findOrCreateFromBooking creates new when no match', function () {
    Customer::factory()->create(['email' => 'a@a.com', 'phone' => '111']);

    $created = Customer::findOrCreateFromBooking([
        'first_name' => 'New',
        'last_name' => 'User',
        'email' => 'b@b.com',
        'phone' => '222',
    ]);

    expect(Customer::count())->toBe(2);
    expect($created->email)->toBe('b@b.com');
});
