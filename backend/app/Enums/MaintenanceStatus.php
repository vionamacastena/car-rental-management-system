<?php

namespace App\Enums;

enum MaintenanceStatus: string
{
    case SCHEDULED = 'scheduled';
    case IN_PROGRESS = 'in_progress';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::SCHEDULED => 'Planifikuar',
            self::IN_PROGRESS => 'Në proces',
            self::COMPLETED => 'Përfunduar',
            self::CANCELLED => 'Anuluar',
        };
    }
}
