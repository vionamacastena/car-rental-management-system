<?php

namespace App\Domain\Pricing;

use App\Models\Vehicle;
use Carbon\CarbonInterface;

class PricingCalculator
{
    /**
     * Kalkulim bazë për Fazën 3 — vetëm daily_price × days.
     * Në Fazën 5 do të zëvendësohet me Pricing Engine të plotë
     * (seasons, weekly/monthly rates, discounts, taxes, fees).
     */
    public function calculate(Vehicle $vehicle, CarbonInterface $pickup, CarbonInterface $return): array
    {
        // Min 1 ditë, rounded up
        $hours = $pickup->diffInHours($return);
        $days = max(1, (int) ceil($hours / 24));

        $dailyPrice = (float) $vehicle->daily_price;
        $subtotal = round($dailyPrice * $days, 2);

        // Placeholders — do mbushen në Fazën 5
        $extras = 0.0;
        $fees = 0.0;
        $taxes = 0.0;
        $discount = 0.0;
        $deposit = 200.0; // standard fixed deposit për Fazën 3

        $total = round($subtotal + $extras + $fees + $taxes - $discount, 2);

        return [
            'days' => $days,
            'daily_price_snapshot' => $dailyPrice,
            'subtotal' => $subtotal,
            'extras_total' => $extras,
            'fees_total' => $fees,
            'taxes_total' => $taxes,
            'discount_total' => $discount,
            'total' => $total,
            'deposit_amount' => $deposit,
        ];
    }
}
