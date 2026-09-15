<?php

use App\Enums\InvoiceStatus;
use App\Enums\RentalStatus;
use App\Enums\VehicleStatus;
use App\Models\Invoice;
use App\Models\Payment;
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
        'status' => RentalStatus::COMPLETED,
        'base_amount' => 250,
        'total_amount' => 250,
        'planned_pickup_at' => now()->subDays(5),
        'planned_return_at' => now(),
    ]);
});

it('requires authentication', function () {
    $this->getJson('/api/v1/admin/invoices')->assertUnauthorized();
});

it('lists invoices', function () {
    Invoice::factory()->count(3)->create();

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/invoices');

    $response->assertOk()->assertJsonCount(3, 'data');
});

it('generates an invoice from a rental', function () {
    $response = $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/invoices', [
            'rental_id' => $this->rental->id,
        ]);

    $response->assertCreated()
        ->assertJsonPath('data.status.value', 'issued');

    $invoice = Invoice::first();
    expect($invoice->invoice_number)->toStartWith('INV-' . now()->year . '-');
    expect((float) $invoice->subtotal)->toBe(250.00);
    // 250 + 18% VAT = 295
    expect((float) $invoice->total)->toBe(295.00);
    expect($invoice->pdf_path)->not->toBeNull();
});

it('returns existing invoice if one already exists for the rental', function () {
    $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/invoices', ['rental_id' => $this->rental->id])
        ->assertCreated();

    $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/invoices', ['rental_id' => $this->rental->id])
        ->assertStatus(200);

    expect(Invoice::count())->toBe(1);
});

it('validates rental_id', function () {
    $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/invoices', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['rental_id']);
});

it('downloads the PDF', function () {
    $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/invoices', ['rental_id' => $this->rental->id])
        ->assertCreated();

    $invoice = Invoice::first();

    $response = $this->withHeaders($this->headers)
        ->get("/api/v1/admin/invoices/{$invoice->id}/pdf");

    $response->assertOk();
    expect($response->headers->get('content-type'))->toBe('application/pdf');
});

it('includes charges in line items', function () {
    $this->rental->update([
        'damage_amount' => 120,
        'fuel_amount' => 40,
    ]);

    $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/invoices', ['rental_id' => $this->rental->id])
        ->assertCreated();

    $invoice = Invoice::first();
    $labels = collect($invoice->line_items)->pluck('label')->all();

    expect($labels)->toContain('Dëmtim automjeti');
    expect($labels)->toContain('Karburant');
    expect((float) $invoice->subtotal)->toBe(410.00); // 250 + 120 + 40
});

it('accounts for paid payments in amount_due', function () {
    Payment::factory()->create([
        'payable_type' => Rental::class,
        'payable_id' => $this->rental->id,
        'customer_id' => $this->rental->customer_id,
        'amount' => 100,
        'type' => 'rental_payment',
    ]);

    $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/invoices', ['rental_id' => $this->rental->id])
        ->assertCreated();

    $invoice = Invoice::first();
    expect((float) $invoice->amount_paid)->toBe(100.0);
    // 295 total - 100 paid = 195 due
    expect((float) $invoice->amount_due)->toBe(195.0);
});

it('marks invoice as paid', function () {
    $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/invoices', ['rental_id' => $this->rental->id])
        ->assertCreated();

    $invoice = Invoice::first();

    $response = $this->withHeaders($this->headers)
        ->postJson("/api/v1/admin/invoices/{$invoice->id}/mark-paid");

    $response->assertOk()
        ->assertJsonPath('data.status.value', 'paid');

    $fresh = $invoice->fresh();
    expect($fresh->paid_at)->not->toBeNull();
    expect((float) $fresh->amount_due)->toBe(0.0);
});

it('regenerates the PDF', function () {
    $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/invoices', ['rental_id' => $this->rental->id])
        ->assertCreated();

    $invoice = Invoice::first();

    $this->withHeaders($this->headers)
        ->postJson("/api/v1/admin/invoices/{$invoice->id}/regenerate")
        ->assertOk();

    expect(Storage::disk('local')->exists($invoice->fresh()->pdf_path))->toBeTrue();
});
