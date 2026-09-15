<?php

namespace Database\Factories;

use App\Enums\ReservationSource;
use App\Enums\ReservationStatus;
use App\Models\Customer;
use App\Models\Location;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReservationFactory extends Factory
{
    public function definition(): array
    {
        $pickup = fake()->dateTimeBetween('+1 day', '+30 days');
        $return = (clone $pickup)->modify('+' . fake()->numberBetween(1, 14) . ' days');

        $dailyPrice = fake()->numberBetween(30, 100);
        $days = (int) ceil(($return->getTimestamp() - $pickup->getTimestamp()) / 86400);
        $subtotal = $dailyPrice * $days;

        return [
            'reservation_code' => 'RES-' . now()->year . '-' . str_pad(fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'customer_id' => Customer::factory(),
            'vehicle_id' => Vehicle::factory(),
            'pickup_location_id' => Location::factory(),
            'return_location_id' => Location::factory(),
            'pickup_at' => $pickup,
            'return_at' => $return,
            'days' => $days,
            'daily_price_snapshot' => $dailyPrice,
            'subtotal' => $subtotal,
            'extras_total' => 0,
            'fees_total' => 0,
            'taxes_total' => 0,
            'discount_total' => 0,
            'total' => $subtotal,
            'deposit_amount' => 200,
            'status' => ReservationStatus::RESERVED,
            'source' => ReservationSource::PUBLIC,
        ];
    }
}
