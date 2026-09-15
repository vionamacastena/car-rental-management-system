<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Enums\MaintenanceStatus;
use App\Enums\MaintenanceType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreMaintenanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicle_id' => ['required', 'integer', 'exists:vehicles,id'],
            'type' => ['required', new Enum(MaintenanceType::class)],
            'status' => ['sometimes', new Enum(MaintenanceStatus::class)],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'scheduled_at' => ['nullable', 'date'],
            'performed_at' => ['nullable', 'date'],
            'next_service_at' => ['nullable', 'date', 'after_or_equal:scheduled_at'],
            'mileage_at_service' => ['nullable', 'integer', 'min:0'],
            'next_service_mileage' => ['nullable', 'integer', 'min:0', 'gte:mileage_at_service'],
            'cost' => ['nullable', 'numeric', 'min:0', 'max:1000000'],
            'provider_name' => ['nullable', 'string', 'max:255'],
            'provider_phone' => ['nullable', 'string', 'max:50'],
            'invoice_number' => ['nullable', 'string', 'max:100'],
            'blocks_vehicle' => ['nullable', 'boolean'],
        ];
    }
}
