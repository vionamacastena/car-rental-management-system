<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CheckoutRentalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pickup_mileage' => ['required', 'integer', 'min:0', 'max:2000000'],
            'pickup_fuel_level' => ['required', 'integer', 'min:0', 'max:100'],

            'checkout_condition' => ['nullable', 'array'],
            'checkout_condition.exterior' => ['nullable', Rule::in(['good', 'minor_scratches', 'damaged'])],
            'checkout_condition.interior' => ['nullable', Rule::in(['clean', 'minor_dirt', 'damaged'])],
            'checkout_condition.existing_damages' => ['nullable', 'array'],
            'checkout_condition.existing_damages.*' => ['string', 'max:255'],

            'checkout_notes' => ['nullable', 'string', 'max:2000'],
            'checkout_signature' => ['nullable', 'string', 'max:500'], // path ose identifier
        ];
    }
}
