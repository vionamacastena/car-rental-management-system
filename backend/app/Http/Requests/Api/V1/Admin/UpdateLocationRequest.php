<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $locationId = $this->route('location')->id;

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('locations', 'name')->ignore($locationId)],
            'address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'opening_hours' => ['nullable', 'array'],
            'opening_hours.mon_fri' => ['nullable', 'string', 'max:50'],
            'opening_hours.sat' => ['nullable', 'string', 'max:50'],
            'opening_hours.sun' => ['nullable', 'string', 'max:50'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
