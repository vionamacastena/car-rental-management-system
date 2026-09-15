<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class PublicBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Vehicle & dates
            'vehicle_id' => ['required', 'integer', 'exists:vehicles,id'],
            'pickup_location_id' => ['required', 'integer', 'exists:locations,id'],
            'return_location_id' => ['required', 'integer', 'exists:locations,id'],
            'pickup_at' => ['required', 'date', 'after:now', 'before:+1 year'],
            'return_at' => ['required', 'date', 'after:pickup_at', 'before:+1 year'],

            // Customer
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'driver_license_number' => ['nullable', 'string', 'max:50'],
            'driver_license_expiry' => ['nullable', 'date'],

            // Notes
            'notes' => ['nullable', 'string', 'max:2000'],

            // Honeypot (anti-bot) — duhet të jetë bosh
            'website' => ['nullable', 'max:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'pickup_at.after' => 'Data e marrjes duhet të jetë në të ardhmen.',
            'return_at.after' => 'Data e kthimit duhet të jetë pas datës së marrjes.',
            'website.max' => 'Kërkesa u refuzua.',
        ];
    }
}
