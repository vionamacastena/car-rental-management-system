<?php

namespace Database\Factories;

use App\Enums\InvoiceStatus;
use App\Models\Customer;
use App\Models\Rental;
use Illuminate\Database\Eloquent\Factories\Factory;

class InvoiceFactory extends Factory
{
    public function definition(): array
    {
        $subtotal = fake()->numberBetween(100, 800);
        $tax = round($subtotal * 0.18, 2);
        $total = $subtotal + $tax;

        return [
            'invoice_number' => 'INV-' . now()->year . '-' . str_pad(fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'rental_id' => Rental::factory(),
            'customer_id' => Customer::factory(),
            'status' => InvoiceStatus::ISSUED,
            'line_items' => [
                ['label' => 'Qiraja e automjetit', 'description' => null, 'qty' => 5, 'unit_price' => $subtotal / 5, 'total' => $subtotal],
            ],
            'subtotal' => $subtotal,
            'tax_amount' => $tax,
            'total' => $total,
            'amount_paid' => 0,
            'amount_due' => $total,
            'issued_at' => now(),
            'due_at' => now()->addDays(14),
        ];
    }
}
