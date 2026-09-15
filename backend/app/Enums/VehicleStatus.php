<?php

namespace App\Enums;

enum VehicleStatus: string
{
    case AVAILABLE = 'available';
    case RESERVED = 'reserved';
    case RENTED = 'rented';
    case CLEANING = 'cleaning';
    case MAINTENANCE = 'maintenance';
    case DAMAGED = 'damaged';
    case OUT_OF_SERVICE = 'out_of_service';
    case SOLD = 'sold';

    public function label(): string
    {
        return match ($this) {
            self::AVAILABLE => 'Available',
            self::RESERVED => 'Reserved',
            self::RENTED => 'Rented',
            self::CLEANING => 'Cleaning',
            self::MAINTENANCE => 'Maintenance',
            self::DAMAGED => 'Damaged',
            self::OUT_OF_SERVICE => 'Out of Service',
            self::SOLD => 'Sold',
        };
    }

    public function isRentable(): bool
    {
        return $this === self::AVAILABLE;
    }
}
