<?php

use App\Enums\DocumentType;
use App\Models\Customer;
use App\Models\Document;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Http\UploadedFile;
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

    $this->customer = Customer::factory()->create();
    $this->vehicle = Vehicle::factory()->create();
});

it('requires authentication', function () {
    $this->getJson('/api/v1/admin/documents')->assertUnauthorized();
});

it('lists documents', function () {
    Document::factory()->count(3)->create();

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/documents');

    $response->assertOk()->assertJsonCount(3, 'data');
});

it('uploads a document for a customer', function () {
    $file = UploadedFile::fake()->create('license.pdf', 500, 'application/pdf');

    $response = $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/documents', [
            'documentable_type' => 'customer',
            'documentable_id' => $this->customer->id,
            'type' => 'driver_license',
            'title' => 'Patenta e klientit',
            'file' => $file,
        ]);

    $response->assertCreated()
        ->assertJsonPath('data.type.value', 'driver_license')
        ->assertJsonPath('data.title', 'Patenta e klientit');

    $doc = Document::first();
    expect($doc->documentable_id)->toBe($this->customer->id);
    expect($doc->documentable_type)->toBe(Customer::class);
    expect(Storage::disk('local')->exists($doc->file_path))->toBeTrue();
});

it('uploads a document for a vehicle', function () {
    $file = UploadedFile::fake()->create('registration.pdf', 500, 'application/pdf');

    $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/documents', [
            'documentable_type' => 'vehicle',
            'documentable_id' => $this->vehicle->id,
            'type' => 'registration',
            'file' => $file,
        ])
        ->assertCreated();

    $doc = Document::first();
    expect($doc->documentable_type)->toBe(Vehicle::class);
});

it('validates required fields', function () {
    $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/documents', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['documentable_type', 'documentable_id', 'type', 'file']);
});

it('rejects invalid documentable type', function () {
    $file = UploadedFile::fake()->create('test.pdf', 500, 'application/pdf');

    $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/documents', [
            'documentable_type' => 'invalid',
            'documentable_id' => 1,
            'type' => 'other',
            'file' => $file,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['documentable_type']);
});

it('rejects file exceeding max size', function () {
    $file = UploadedFile::fake()->create('huge.pdf', 25000, 'application/pdf');

    $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/documents', [
            'documentable_type' => 'customer',
            'documentable_id' => $this->customer->id,
            'type' => 'other',
            'file' => $file,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['file']);
});

it('filters documents by documentable', function () {
    Document::factory()->create([
        'documentable_type' => Customer::class,
        'documentable_id' => $this->customer->id,
    ]);
    Document::factory()->create([
        'documentable_type' => Vehicle::class,
        'documentable_id' => $this->vehicle->id,
    ]);

    $response = $this->withHeaders($this->headers)
        ->getJson("/api/v1/admin/documents?documentable_type=customer&documentable_id={$this->customer->id}");

    $response->assertOk()->assertJsonCount(1, 'data');
});

it('downloads a document', function () {
    $file = UploadedFile::fake()->create('test.pdf', 500, 'application/pdf');

    $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/documents', [
            'documentable_type' => 'customer',
            'documentable_id' => $this->customer->id,
            'type' => 'driver_license',
            'file' => $file,
        ])
        ->assertCreated();

    $doc = Document::first();

    $response = $this->withHeaders($this->headers)
        ->get("/api/v1/admin/documents/{$doc->id}/download");

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('application/pdf');
});

it('deletes a document and its file', function () {
    $file = UploadedFile::fake()->create('test.pdf', 500, 'application/pdf');

    $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/documents', [
            'documentable_type' => 'customer',
            'documentable_id' => $this->customer->id,
            'type' => 'driver_license',
            'file' => $file,
        ])
        ->assertCreated();

    $doc = Document::first();
    $path = $doc->file_path;

    $this->withHeaders($this->headers)
        ->deleteJson("/api/v1/admin/documents/{$doc->id}")
        ->assertOk();

    $this->assertDatabaseMissing('documents', ['id' => $doc->id]);
    expect(Storage::disk('local')->exists($path))->toBeFalse();
});

it('marks document as expiring', function () {
    $doc = Document::factory()->create([
        'expires_at' => now()->addDays(15),
    ]);

    $response = $this->withHeaders($this->headers)
        ->getJson("/api/v1/admin/documents/{$doc->id}");

    $response->assertOk()
        ->assertJsonPath('data.expires_in_days', 15)
        ->assertJsonPath('data.is_expired', false);
});

it('detects expired documents', function () {
    $doc = Document::factory()->create([
        'expires_at' => now()->subDays(5),
    ]);

    $response = $this->withHeaders($this->headers)
        ->getJson("/api/v1/admin/documents/{$doc->id}");

    $response->assertOk()
        ->assertJsonPath('data.is_expired', true);
});
