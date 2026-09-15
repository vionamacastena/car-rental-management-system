<?php

namespace Database\Factories;

use App\Enums\DocumentType;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

class DocumentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'documentable_type' => Customer::class,
            'documentable_id' => Customer::factory(),
            'type' => DocumentType::OTHER,
            'title' => fake()->sentence(3),
            'description' => null,
            'file_path' => 'documents/' . fake()->uuid() . '.pdf',
            'file_name' => fake()->word() . '.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => fake()->numberBetween(10000, 5000000),
            'metadata' => null,
            'expires_at' => null,
            'is_confidential' => false,
        ];
    }
}
