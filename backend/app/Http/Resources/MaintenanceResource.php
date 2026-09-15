<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MaintenanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'maintenance_code' => $this->maintenance_code,
            'vehicle' => new VehicleResource($this->whenLoaded('vehicle')),

            'type' => [
                'value' => $this->type->value,
                'label' => $this->type->label(),
            ],
            'status' => [
                'value' => $this->status->value,
                'label' => $this->status->label(),
            ],

            'title' => $this->title,
            'description' => $this->description,

            'scheduled_at' => $this->scheduled_at?->toDateString(),
            'performed_at' => $this->performed_at?->toDateString(),
            'next_service_at' => $this->next_service_at?->toDateString(),
            'days_until_next_service' => $this->daysUntilNextService(),
            'is_overdue' => $this->isOverdue(),

            'mileage_at_service' => $this->mileage_at_service,
            'next_service_mileage' => $this->next_service_mileage,

            'cost' => (float) $this->cost,
            'provider_name' => $this->provider_name,
            'provider_phone' => $this->provider_phone,
            'invoice_number' => $this->invoice_number,

            'blocks_vehicle' => $this->blocks_vehicle,

            'created_by' => $this->whenLoaded('createdBy', fn () => [
                'id' => $this->createdBy->id,
                'name' => $this->createdBy->name,
            ]),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
