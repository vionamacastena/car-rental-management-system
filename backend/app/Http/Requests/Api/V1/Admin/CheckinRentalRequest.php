<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CheckinRentalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'return_mileage' => ['required', 'integer', 'min:0', 'max:2000000'],
            'return_fuel_level' => ['required', 'integer', 'min:0', 'max:100'],

            'checkin_condition' => ['nullable', 'array'],
            'checkin_condition.exterior' => ['nullable', Rule::in(['good', 'minor_scratches', 'damaged'])],
            'checkin_condition.interior' => ['nullable', Rule::in(['clean', 'minor_dirt', 'damaged'])],
            'checkin_condition.new_damages' => ['nullable', 'array'],
            'checkin_condition.new_damages.*.area' => ['required_with:checkin_condition.new_damages', 'string', 'max:100'],
            'checkin_condition.new_damages.*.type' => ['required_with:checkin_condition.new_damages', 'string', 'max:50'],
            'checkin_condition.new_damages.*.severity' => ['nullable', Rule::in(['minor', 'moderate', 'severe'])],
            'checkin_condition.new_damages.*.description' => ['nullable', 'string', 'max:500'],
            'checkin_condition.new_damages.*.estimated_cost' => ['nullable', 'numeric', 'min:0'],

            'checkin_notes' => ['nullable', 'string', 'max:2000'],
            'checkin_signature' => ['nullable', 'string', 'max:500000'],

            // Charges shtesë manuale (nga admin)
            'fuel_charge' => ['nullable', 'numeric', 'min:0', 'max:10000'],
            'damage_charge' => ['nullable', 'numeric', 'min:0', 'max:100000'],
            'extra_mileage_charge' => ['nullable', 'numeric', 'min:0', 'max:10000'],
            'late_return_charge' => ['nullable', 'numeric', 'min:0', 'max:10000'],
            'other_charges' => ['nullable', 'numeric', 'min:0', 'max:10000'],

            // Manual override për deduction/refund (nëse admin do override)
            'deposit_deduction' => ['nullable', 'numeric', 'min:0'],
            'deposit_refund' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
