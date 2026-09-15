<?php

use App\Models\User;
use App\Notifications\NewReservationNotification;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;

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
    $this->getJson('/api/v1/admin/notifications')->assertUnauthorized();
});

it('lists notifications', function () {
    Notification::send($this->admin, new \App\Notifications\PaymentReceivedNotification(
        \App\Models\Payment::factory()->create()
    ));

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/notifications');

    $response->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonStructure([
            'data' => [
                '*' => ['id', 'type', 'title', 'message', 'is_read', 'created_at'],
            ],
            'meta' => ['total', 'unread_count'],
        ]);
});

it('returns unread count', function () {
    Notification::send($this->admin, new \App\Notifications\PaymentReceivedNotification(
        \App\Models\Payment::factory()->create()
    ));

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/notifications/unread-count');

    $response->assertOk()
        ->assertJsonPath('data.unread_count', 1);
});

it('marks one notification as read', function () {
    Notification::send($this->admin, new \App\Notifications\PaymentReceivedNotification(
        \App\Models\Payment::factory()->create()
    ));

    $notification = $this->admin->notifications()->first();

    $response = $this->withHeaders($this->headers)
        ->postJson("/api/v1/admin/notifications/{$notification->id}/read");

    $response->assertOk()
        ->assertJsonPath('data.is_read', true);

    expect($notification->fresh()->read_at)->not->toBeNull();
});

it('marks all notifications as read', function () {
    Notification::send($this->admin, new \App\Notifications\PaymentReceivedNotification(
        \App\Models\Payment::factory()->create()
    ));
    Notification::send($this->admin, new \App\Notifications\PaymentReceivedNotification(
        \App\Models\Payment::factory()->create()
    ));

    $response = $this->withHeaders($this->headers)
        ->postJson('/api/v1/admin/notifications/mark-all-read');

    $response->assertOk();
    expect($this->admin->fresh()->unreadNotifications()->count())->toBe(0);
});

it('filters unread only', function () {
    Notification::send($this->admin, new \App\Notifications\PaymentReceivedNotification(
        \App\Models\Payment::factory()->create()
    ));

    $first = $this->admin->notifications()->first();
    $first->markAsRead();

    Notification::send($this->admin, new \App\Notifications\PaymentReceivedNotification(
        \App\Models\Payment::factory()->create()
    ));

    $response = $this->withHeaders($this->headers)
        ->getJson('/api/v1/admin/notifications?unread_only=1');

    $response->assertOk()->assertJsonCount(1, 'data');
});

it('deletes a notification', function () {
    Notification::send($this->admin, new \App\Notifications\PaymentReceivedNotification(
        \App\Models\Payment::factory()->create()
    ));

    $notification = $this->admin->notifications()->first();

    $this->withHeaders($this->headers)
        ->deleteJson("/api/v1/admin/notifications/{$notification->id}")
        ->assertOk();

    expect($this->admin->fresh()->notifications()->count())->toBe(0);
});

it('cannot read another user notification', function () {
    $other = User::factory()->create(['is_active' => true]);
    Notification::send($other, new \App\Notifications\PaymentReceivedNotification(
        \App\Models\Payment::factory()->create()
    ));

    $notification = $other->notifications()->first();

    $this->withHeaders($this->headers)
        ->postJson("/api/v1/admin/notifications/{$notification->id}/read")
        ->assertNotFound();
});
