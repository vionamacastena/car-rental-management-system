<?php

namespace App\Enums;

enum DocumentType: string
{
    // Customer
    case DRIVER_LICENSE = 'driver_license';
    case ID_CARD = 'id_card';
    case PASSPORT = 'passport';

    // Vehicle
    case REGISTRATION = 'registration';
    case INSURANCE = 'insurance';
    case TECHNICAL_INSPECTION = 'technical_inspection';
    case OWNERSHIP = 'ownership';
    case SERVICE_RECORD = 'service_record';

    // Rental
    case CONTRACT = 'contract';
    case INVOICE = 'invoice';
    case DAMAGE_PHOTO = 'damage_photo';
    case CHECKIN_PHOTO = 'checkin_photo';
    case CHECKOUT_PHOTO = 'checkout_photo';

    // Generic
    case OTHER = 'other';

    public function label(): string
    {
        return match ($this) {
            self::DRIVER_LICENSE => 'Driver License',
            self::ID_CARD => 'ID Card',
            self::PASSPORT => 'Passport',
            self::REGISTRATION => 'Registration',
            self::INSURANCE => 'Insurance',
            self::TECHNICAL_INSPECTION => 'Technical Inspection',
            self::OWNERSHIP => 'Ownership',
            self::SERVICE_RECORD => 'Service Record',
            self::CONTRACT => 'Contract',
            self::INVOICE => 'Invoice',
            self::DAMAGE_PHOTO => 'Damage Photo',
            self::CHECKIN_PHOTO => 'Check-in Photo',
            self::CHECKOUT_PHOTO => 'Check-out Photo',
            self::OTHER => 'Other',
        };
    }

    public static function forCustomer(): array
    {
        return [self::DRIVER_LICENSE, self::ID_CARD, self::PASSPORT, self::OTHER];
    }

    public static function forVehicle(): array
    {
        return [
            self::REGISTRATION, self::INSURANCE, self::TECHNICAL_INSPECTION,
            self::OWNERSHIP, self::SERVICE_RECORD, self::OTHER,
        ];
    }

    public static function forRental(): array
    {
        return [
            self::CONTRACT, self::INVOICE, self::DAMAGE_PHOTO,
            self::CHECKIN_PHOTO, self::CHECKOUT_PHOTO, self::OTHER,
        ];
    }
}
