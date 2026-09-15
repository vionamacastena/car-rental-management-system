<?php

namespace App\Enums;

enum RentalStatus: string
{
    case PENDING_CHECKOUT = 'pending_checkout';
    case ACTIVE = 'active';
    case PENDING_CHECKIN = 'pending_checkin';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::PENDING_CHECKOUT => 'Pending Check-out',
            self::ACTIVE => 'Active',
            self::PENDING_CHECKIN => 'Pending Check-in',
            self::COMPLETED => 'Completed',
            self::CANCELLED => 'Cancelled',
        };
    }

    public function isOpen(): bool
    {
        return in_array($this, [
            self::PENDING_CHECKOUT,
            self::ACTIVE,
            self::PENDING_CHECKIN,
        ], true);
    }
}
