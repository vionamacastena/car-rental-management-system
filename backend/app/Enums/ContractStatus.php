<?php

namespace App\Enums;

enum ContractStatus: string
{
    case DRAFT = 'draft';
    case PENDING_SIGNATURE = 'pending_signature';
    case SIGNED = 'signed';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::PENDING_SIGNATURE => 'Pending Signature',
            self::SIGNED => 'Signed',
            self::CANCELLED => 'Cancelled',
        };
    }

    public function isSigned(): bool
    {
        return $this === self::SIGNED;
    }
}
