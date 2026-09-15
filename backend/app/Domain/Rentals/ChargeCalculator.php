<?php

namespace App\Domain\Rentals;

use App\Models\Rental;

class ChargeCalculator
{
    /**
     * Kalkulon charges shtesë për një kthim.
     * Në këtë fazë, admin jep shumat manuale; në Fazën 5 do të bëhet automatikisht
     * me mileage policy, fuel policy, dhe damage cost tables.
     */
    public function calculateAdditionalCharges(Rental $rental, array $data): array
    {
        $fuelCharge = (float) ($data['fuel_charge'] ?? 0);
        $damageCharge = (float) ($data['damage_charge'] ?? 0);
        $extraMileageCharge = (float) ($data['extra_mileage_charge'] ?? 0);
        $lateReturnCharge = (float) ($data['late_return_charge'] ?? 0);
        $otherCharges = (float) ($data['other_charges'] ?? 0);

        // Mileage i përdorur
        $mileageUsed = null;
        if ($rental->pickup_mileage !== null && isset($data['return_mileage'])) {
            $mileageUsed = max(0, (int) $data['return_mileage'] - (int) $rental->pickup_mileage);
        }

        // Totali final = base + extras + fees + taxes - discount + charges shtesë
        $total = (float) $rental->base_amount
            + (float) $rental->extras_amount
            + (float) $rental->fees_amount
            + (float) $rental->taxes_amount
            - (float) $rental->discount_amount
            + $fuelCharge
            + $damageCharge
            + $extraMileageCharge
            + $lateReturnCharge
            + $otherCharges;

        return [
            'mileage_used' => $mileageUsed,
            'fuel_amount' => $fuelCharge,
            'damage_amount' => $damageCharge,
            'extra_mileage_amount' => $extraMileageCharge,
            'late_return_amount' => $lateReturnCharge,
            'other_charges_amount' => $otherCharges,
            'total_amount' => round($total, 2),
        ];
    }

    /**
     * Kalkulon deduction/refund nga depozita.
     * Rregull: deduction = damage_amount + fuel_amount + extra_mileage + late + other
     * (kurse base/extras/fees/taxes paguhen veç).
     * Në realitet, kjo varet nga politikat e kompanisë. Për Fazën 4:
     *   - deduction = totali i charges shtesë (jo base rental)
     *   - refund = deposit - deduction (min 0)
     */
    public function calculateDepositSettlement(Rental $rental, array $charges): array
    {
        $deduction = (float) $charges['fuel_amount']
            + (float) $charges['damage_amount']
            + (float) $charges['extra_mileage_amount']
            + (float) $charges['late_return_amount']
            + (float) $charges['other_charges_amount'];

        $deposit = (float) $rental->deposit_amount;
        $refund = max(0, $deposit - $deduction);

        return [
            'deposit_deduction' => round($deduction, 2),
            'deposit_refund' => round($refund, 2),
        ];
    }
}
