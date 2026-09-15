<?php

use App\Events\ReservationCreated;
use App\Models\Customer;
use App\Models\Location;
use App\Models\Reservation;
use App\Models\User;
use App\Models\Vehicle;
use App\Notifications\NewReservationNotification;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;

it('dispatches ReservationCreated event when public booking is made', function () {
    Event::fake([ReservationCreated::class]);

    $vehicle = Vehicle::factory()->create(['status' => 'available']);
    $pickup = Location::factory()->create();
    $return = Location::factory()->create();

    $this->postJson('/api/v1/reservations', [
        'vehicle_id' => $vehicle->id,
        'pickup_location_id' => $pickup->id,
        'return_location_id' => $return->id,
        'pickup_at' => now()->addDays(3)->format('Y-m-d H:i:s'),
        'return_at' => now()->addDays(7)->format('Y-m-d H:i:s'),
        'first_name' => 'Test',
        'last_name' => 'User',
        'email' => 'test@example.com',
        'phone' => '+383 44 123 456',
    ])->assertCreated();

    Event::assertDispatched(ReservationCreated::class);
});

it('sends notification to active admins on ReservationCreated', function () {
    Notification::fake();

    $activeAdmin = User::factory()->create(['is_active' => true]);
    $inactiveAdmin = User::factory()->create(['is_active' => false]);

    $reservation = Reservation::factory()->create();

    ReservationCreated::dispatch($reservation);

    Notification::assertSentTo($activeAdmin, NewReservationNotification::class);
    Notification::assertNotSentTo($inactiveAdmin, NewReservationNotification::class);
});
