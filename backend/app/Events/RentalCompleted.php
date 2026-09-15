<?php

namespace App\Events;

use App\Models\Rental;
use Illuminate\Foundation\Events\Dispatchable;

class RentalCompleted
{
    use Dispatchable;

    public function __construct(
        public readonly Rental $rental,
    ) {}
}
