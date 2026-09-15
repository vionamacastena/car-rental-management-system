<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class CustomerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->unique()->numerify('+383 4# ### ###'),
            'address' => fake()->streetAddress(),
            'city' => fake()->randomElement(['Prishtina', 'Prizren', 'Peja', 'Gjakova']),
            'country' => 'Kosovo',
            'date_of_birth' => fake()->dateTimeBetween('-60 years', '-20 years'),
            'driver_license_number' => strtoupper(fake()->bothify('??######')),
            'driver_license_expiry' => fake()->dateTimeBetween('now', '+5 years'),
        ];
    }
}
