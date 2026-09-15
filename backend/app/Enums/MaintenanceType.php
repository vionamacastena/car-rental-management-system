<?php

namespace App\Enums;

enum MaintenanceType: string
{
    case OIL_CHANGE = 'oil_change';
    case TIRES = 'tires';
    case BRAKES = 'brakes';
    case SERVICE = 'service';
    case REPAIR = 'repair';
    case INSPECTION = 'inspection';
    case REGISTRATION = 'registration';
    case INSURANCE = 'insurance';
    case WASHING = 'washing';
    case DETAILING = 'detailing';
    case OTHER = 'other';

    public function label(): string
    {
        return match ($this) {
            self::OIL_CHANGE => 'Ndryshim vaji',
            self::TIRES => 'Goma',
            self::BRAKES => 'Frena',
            self::SERVICE => 'Servis',
            self::REPAIR => 'Riparim',
            self::INSPECTION => 'Inspektim teknik',
            self::REGISTRATION => 'Regjistrim',
            self::INSURANCE => 'Sigurim',
            self::WASHING => 'Larje',
            self::DETAILING => 'Detailing',
            self::OTHER => 'Tjetër',
        };
    }

    /**
     * Cilat tipe kërkojnë dokument (regjistrim, sigurim, inspektim)?
     */
    public function needsDocument(): bool
    {
        return in_array($this, [
            self::REGISTRATION,
            self::INSURANCE,
            self::INSPECTION,
        ], true);
    }
}
