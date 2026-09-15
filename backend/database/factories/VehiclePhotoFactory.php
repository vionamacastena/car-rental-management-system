<?php

namespace Database\Factories;

use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

class VehiclePhotoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'vehicle_id' => Vehicle::factory(),
            'path' => 'vehicles/1/' . fake()->uuid() . '.jpg',
            'is_primary' => false,
            'sort_order' => 0,
        ];
    }
}
