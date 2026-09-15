<?php

namespace App\Enums;

enum ReservationStatus: string
{
    case INQUIRY = 'inquiry';
    case RESERVED = 'reserved';
    case PICKED_UP = 'picked_up';
    case ACTIVE = 'active';
    case RETURNED = 'returned';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';
    case NO_SHOW = 'no_show';
    case OVERDUE = 'overdue';

    public function label(): string
    {
        return match ($this) {
            self::INQUIRY => 'Inquiry',
            self::RESERVED => 'Reserved',
            self::PICKED_UP => 'Picked Up',
            self::ACTIVE => 'Active',
            self::RETURNED => 'Returned',
            self::COMPLETED => 'Completed',
            self::CANCELLED => 'Cancelled',
            self::NO_SHOW => 'No Show',
            self::OVERDUE => 'Overdue',
        };
    }

    /**
     * A e bllokon kjo status periudhën për rezervime të tjera?
     * Statuset aktive (RESERVED, PICKED_UP, ACTIVE, OVERDUE) bllokojnë.
     * Statuset finale (COMPLETED, CANCELLED, NO_SHOW) nuk bllokojnë.
     * INQUIRY nuk bllokon (është vetëm pyetje, pa konfirmim).
     */
    public function isBlocking(): bool
    {
        return in_array($this, [
            self::RESERVED,
            self::PICKED_UP,
            self::ACTIVE,
            self::OVERDUE,
        ], true);
    }

    public static function blockingValues(): array
    {
        return array_values(array_map(
            fn (self $s) => $s->value,
            array_filter(self::cases(), fn (self $s) => $s->isBlocking()),
        ));
    }
}
