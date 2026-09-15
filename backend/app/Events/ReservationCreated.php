<?php

namespace App\Events;

use App\Models\Reservation;
use Illuminate\Foundation\Events\Dispatchable;

class ReservationCreated
{
    use Dispatchable;

    public function __construct(
        public readonly Reservation $reservation,
    ) {}
}
