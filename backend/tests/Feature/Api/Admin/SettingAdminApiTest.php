<?php

use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

beforeEach(function () {
    $this->seed(\Database\Seeders\SettingSeeder::class);

    $this->admin = User::factory()->create([
        'email' => 'admin@test.com',
        'password' => Hash::make('password123'),
        'is_active' => true,
    ]);
    $this->token = $this->admin->createToken('test')->plainTextToken;
    $this->headers = ['Authorization' => "Bearer {$this->token}"];
});

it('lists grouped settings', function () {
    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/settings');

    $response->assertOk()
        ->assertJsonStructure([
            'data' => [
                'company',
                'pricing',
                'notifications',
                'booking',
            ],
        ]);
});

it('filters by group', function () {
    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/settings?group=pricing');

    $response->assertOk()
        ->assertJsonStructure(['data' => ['pricing']])
        ->assertJsonMissingPath('data.company');
});

it('updates settings in bulk', function () {
    $response = $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/settings/bulk-update', [
            'settings' => [
                'company_name' => 'Updated Name',
                'tax_rate' => 20,
                'min_rental_days' => 2,
            ],
        ]);

    $response->assertOk();

    expect(Setting::get('company_name'))->toBe('Updated Name');
    expect(Setting::get('tax_rate'))->toBe(20.0);
    expect(Setting::get('min_rental_days'))->toBe(2);
});

it('returns only public settings to unauthenticated users', function () {
    $response = $this->getJson('/api/v1/settings/public');

    $response->assertOk()
        ->assertJsonPath('data.company_name', 'Driveway Rent-A-Car')
        ->assertJsonMissingPath('data.tax_rate') // tax_rate nuk është public
        ->assertJsonMissingPath('data.default_deposit_amount');
});

it('caches settings and clears on update', function () {
    Setting::get('company_name'); // populate cache
    expect(\Illuminate\Support\Facades\Cache::has('settings:all'))->toBeTrue();

    $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/settings/bulk-update', [
            'settings' => ['company_name' => 'New'],
        ]);

    expect(\Illuminate\Support\Facades\Cache::has('settings:all'))->toBeFalse();
});
