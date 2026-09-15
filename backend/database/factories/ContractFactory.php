<?php

namespace Database\Factories;

use App\Enums\ContractStatus;
use App\Models\Customer;
use App\Models\Rental;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

class ContractFactory extends Factory
{
    public function definition(): array
    {
        return [
            'contract_number' => 'CON-' . now()->year . '-' . str_pad(fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'rental_id' => Rental::factory(),
            'customer_id' => Customer::factory(),
            'vehicle_id' => Vehicle::factory(),
            'status' => ContractStatus::DRAFT,
            'contract_version' => 1,
            'terms_snapshot' => [
                'mileage_policy' => '250 km në ditë, pastaj 0.20€ / km',
                'fuel_policy' => 'Ktheu me të njëjtin nivel karburanti',
                'insurance' => 'Kasko e plotë me pjesëmarrje 300€',
                'deposit' => 300,
                'late_return' => '0.10€ / minutë vonesë',
            ],
        ];
    }
}
