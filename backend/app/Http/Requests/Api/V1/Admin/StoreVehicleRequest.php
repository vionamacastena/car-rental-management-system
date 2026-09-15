<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Enums\FuelType;
use App\Enums\Transmission;
use App\Enums\VehicleStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'brand' => ['required', 'string', 'max:255'],
            'model' => ['required', 'string', 'max:255'],
            'year' => ['required', 'integer', 'min:1990', 'max:' . (date('Y') + 1)],
            'license_plate' => ['required', 'string', 'max:20', 'unique:vehicles,license_plate'],
            'vin' => ['nullable', 'string', 'max:20', 'unique:vehicles,vin'],
            'color' => ['nullable', 'string', 'max:50'],
            'mileage' => ['required', 'integer', 'min:0', 'max:2000000'],
            'fuel_type' => ['required', new Enum(FuelType::class)],
            'transmission' => ['required', new Enum(Transmission::class)],
            'seats' => ['required', 'integer', 'min:1', 'max:20'],
            'current_location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'status' => ['required', new Enum(VehicleStatus::class)],
            'daily_price' => ['required', 'numeric', 'min:0', 'max:100000'],
            'purchase_price' => ['nullable', 'numeric', 'min:0', 'max:1000000'],
            'current_value' => ['nullable', 'numeric', 'min:0', 'max:1000000'],
            'description' => ['nullable', 'string', 'max:5000'],
            'features' => ['nullable', 'array'],
            'features.*' => ['string', 'max:100'],
        ];
    }
}
