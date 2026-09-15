<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

beforeEach(function () {
    $this->admin = User::factory()->create([
        'email' => 'admin@test.com',
        'password' => Hash::make('password123'),
        'is_active' => true,
    ]);
});

it('logs in with valid credentials', function () {
    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'admin@test.com',
        'password' => 'password123',
    ]);

    $response->assertOk()
        ->assertJsonStructure([
            'data' => [
                'user' => ['id', 'name', 'email'],
                'token',
            ],
        ]);

    expect($response->json('data.token'))->toBeString()->not->toBeEmpty();
    expect($this->admin->fresh()->last_login_at)->not->toBeNull();
});

it('rejects invalid credentials', function () {
    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'admin@test.com',
        'password' => 'wrongpass123',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
});

it('rejects inactive admin', function () {
    $this->admin->update(['is_active' => false]);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'admin@test.com',
        'password' => 'password123',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
});

it('returns authenticated user via /me', function () {
    $token = $this->admin->createToken('test')->plainTextToken;

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/v1/auth/me');

    $response->assertOk()
        ->assertJsonPath('data.email', 'admin@test.com');
});

it('returns 401 on /me without token', function () {
    $this->getJson('/api/v1/auth/me')->assertUnauthorized();
});

it('logs out and revokes token', function () {
    $token = $this->admin->createToken('test');
    $plainToken = $token->plainTextToken;

    // Para logout: 1 token aktiv
    expect($this->admin->tokens()->count())->toBe(1);

    $this->withHeader('Authorization', "Bearer {$plainToken}")
        ->postJson('/api/v1/auth/logout')
        ->assertOk();

    // Pas logout: 0 tokens
    expect($this->admin->fresh()->tokens()->count())->toBe(0);
});

it('rate limits login attempts', function () {
    for ($i = 0; $i < 5; $i++) {
        $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@test.com',
            'password' => 'wrongpass123',
        ])->assertUnprocessable();
    }

    $this->postJson('/api/v1/auth/login', [
        'email' => 'admin@test.com',
        'password' => 'wrongpass123',
    ])->assertStatus(429);
});
