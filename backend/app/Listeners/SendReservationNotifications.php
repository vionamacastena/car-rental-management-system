<?php

namespace App\Listeners;

use App\Events\ReservationCreated;
use App\Models\User;
use App\Notifications\NewReservationNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Notification;

class SendReservationNotifications implements ShouldQueue
{
    public function handle(ReservationCreated $event): void
    {
        $admins = User::where('is_active', true)->get();

        Notification::send($admins, new NewReservationNotification($event->reservation));
    }
}
