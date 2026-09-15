<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehicleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'brand' => $this->brand,
            'model' => $this->model,
            'full_name' => $this->fullName(),
            'year' => $this->year,
            'license_plate' => $this->license_plate,
            'vin' => $this->when(
                $request->user() !== null,
                $this->vin
            ),
            'color' => $this->color,
            'mileage' => $this->mileage,
            'fuel_type' => [
                'value' => $this->fuel_type->value,
                'label' => $this->fuel_type->label(),
            ],
            'transmission' => [
                'value' => $this->transmission->value,
                'label' => $this->transmission->label(),
            ],
            'seats' => $this->seats,
            'status' => [
                'value' => $this->status->value,
                'label' => $this->status->label(),
            ],
            'daily_price' => (float) $this->daily_price,
            'description' => $this->description,
            'features' => $this->features ?? [],
            'location' => new LocationResource($this->whenLoaded('currentLocation')),
            'photos' => VehiclePhotoResource::collection($this->whenLoaded('photos')),
            'primary_photo' => new VehiclePhotoResource($this->whenLoaded('primaryPhoto')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
