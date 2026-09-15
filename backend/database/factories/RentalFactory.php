<?php

namespace Database\Factories;

use App\Enums\RentalStatus;
use App\Models\Customer;
use App\Models\Location;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

class RentalFactory extends Factory
{
    public function definition(): array
    {
        $pickup = fake()->dateTimeBetween('-3 days', 'now');
        $return = (clone $pickup)->modify('+' . fake()->numberBetween(2, 10) . ' days');
        $base = fake()->numberBetween(150, 800);

        return [
            'rental_code' => 'RNT-' . now()->year . '-' . str_pad(fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'reservation_id' => null,
            'customer_id' => Customer::factory(),
            'vehicle_id' => Vehicle::factory(),
            'pickup_location_id' => Location::factory(),
            'return_location_id' => Location::factory(),
            'planned_pickup_at' => $pickup,
            'planned_return_at' => $return,
            'status' => RentalStatus::PENDING_CHECKOUT,
            'base_amount' => $base,
            'total_amount' => $base,
            'deposit_amount' => 200,
        ];
    }
}
