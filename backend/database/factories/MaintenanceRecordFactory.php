<?php

namespace Database\Factories;

use App\Enums\MaintenanceStatus;
use App\Enums\MaintenanceType;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

class MaintenanceRecordFactory extends Factory
{
    public function definition(): array
    {
        $types = MaintenanceType::cases();
        $statuses = MaintenanceStatus::cases();

        return [
            'maintenance_code' => 'MNT-' . now()->year . '-' . str_pad(fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'vehicle_id' => Vehicle::factory(),
            'type' => fake()->randomElement($types),
            'status' => fake()->randomElement($statuses),
            'title' => fake()->sentence(3),
            'description' => fake()->optional()->paragraph(),
            'scheduled_at' => fake()->dateTimeBetween('-30 days', '+30 days'),
            'performed_at' => fake()->optional()->dateTimeBetween('-60 days', 'now'),
            'cost' => fake()->numberBetween(20, 800),
            'provider_name' => fake()->optional()->company(),
        ];
    }
}
