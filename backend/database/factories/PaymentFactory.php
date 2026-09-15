<?php

namespace Database\Factories;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Models\Customer;
use App\Models\Rental;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'payment_code' => 'PAY-' . now()->year . '-' . str_pad(fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'payable_type' => Rental::class,
            'payable_id' => Rental::factory(),
            'customer_id' => Customer::factory(),
            'type' => PaymentType::RENTAL_PAYMENT,
            'method' => PaymentMethod::CASH,
            'status' => PaymentStatus::COMPLETED,
            'amount' => fake()->numberBetween(100, 1000),
            'refunded_amount' => 0,
            'paid_at' => now(),
        ];
    }
}
