<?php

namespace App\Enums;

enum FuelType: string
{
    case PETROL = 'petrol';
    case DIESEL = 'diesel';
    case ELECTRIC = 'electric';
    case HYBRID = 'hybrid';

    public function label(): string
    {
        return match ($this) {
            self::PETROL => 'Petrol',
            self::DIESEL => 'Diesel',
            self::ELECTRIC => 'Electric',
            self::HYBRID => 'Hybrid',
        };
    }
}
