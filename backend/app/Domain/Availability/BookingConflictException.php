<?php

namespace App\Domain\Availability;

use RuntimeException;

class BookingConflictException extends RuntimeException
{
    public function __construct(string $message = 'Automjeti nuk është i disponueshëm për këtë periudhë.')
    {
        parent::__construct($message);
    }
}
