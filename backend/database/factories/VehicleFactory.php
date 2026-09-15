<?php

namespace Database\Factories;

use App\Enums\FuelType;
use App\Enums\Transmission;
use App\Enums\VehicleStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

class VehicleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'brand' => fake()->randomElement(['BMW', 'Audi', 'Mercedes', 'VW']),
            'model' => fake()->word(),
            'year' => fake()->numberBetween(2018, 2024),
            'license_plate' => strtoupper(fake()->unique()->bothify('##-???-##')),
            'vin' => strtoupper(fake()->unique()->bothify('?????????????????')),
            'color' => fake()->colorName(),
            'mileage' => fake()->numberBetween(1000, 100000),
            'fuel_type' => FuelType::PETROL->value,
            'transmission' => Transmission::AUTOMATIC->value,
            'seats' => 5,
            'status' => VehicleStatus::AVAILABLE->value,
            'daily_price' => fake()->numberBetween(30, 100),
        ];
    }
}
