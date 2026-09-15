<?php

namespace App\Enums;

enum PaymentType: string
{
    case RENTAL_PAYMENT = 'rental_payment';       // Pagesa e rentalit (base + extras + taxes)
    case DEPOSIT_RECEIVED = 'deposit_received';   // Depozita e marrë
    case DEPOSIT_REFUND = 'deposit_refund';       // Rimbursim depozite
    case EXTRA_CHARGE = 'extra_charge';           // Tarifë shtesë (dëmtim, vonesë, karburant)
    case REFUND = 'refund';                       // Rimbursim i përgjithshëm

    public function label(): string
    {
        return match ($this) {
            self::RENTAL_PAYMENT => 'Rental Payment',
            self::DEPOSIT_RECEIVED => 'Deposit Received',
            self::DEPOSIT_REFUND => 'Deposit Refund',
            self::EXTRA_CHARGE => 'Extra Charge',
            self::REFUND => 'Refund',
        };
    }

    public function isIncoming(): bool
    {
        return in_array($this, [
            self::RENTAL_PAYMENT,
            self::DEPOSIT_RECEIVED,
            self::EXTRA_CHARGE,
        ], true);
    }

    public function isOutgoing(): bool
    {
        return in_array($this, [
            self::DEPOSIT_REFUND,
            self::REFUND,
        ], true);
    }
}
