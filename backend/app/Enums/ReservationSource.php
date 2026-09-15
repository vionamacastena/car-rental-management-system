<?php

namespace App\Enums;

enum ReservationSource: string
{
    case PUBLIC = 'public';
    case ADMIN = 'admin';

    public function label(): string
    {
        return match ($this) {
            self::PUBLIC => 'Public',
            self::ADMIN => 'Admin',
        };
    }
}
