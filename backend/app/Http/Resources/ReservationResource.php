<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReservationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reservation_code' => $this->reservation_code,

            'customer' => new CustomerResource($this->whenLoaded('customer')),
            'vehicle' => new VehicleResource($this->whenLoaded('vehicle')),
            'pickup_location' => new LocationResource($this->whenLoaded('pickupLocation')),
            'return_location' => new LocationResource($this->whenLoaded('returnLocation')),

            'pickup_at' => $this->pickup_at->toIso8601String(),
            'return_at' => $this->return_at->toIso8601String(),
            'days' => $this->days,

            'pricing' => [
                'daily_price_snapshot' => (float) $this->daily_price_snapshot,
                'subtotal' => (float) $this->subtotal,
                'extras_total' => (float) $this->extras_total,
                'fees_total' => (float) $this->fees_total,
                'taxes_total' => (float) $this->taxes_total,
                'discount_total' => (float) $this->discount_total,
                'total' => (float) $this->total,
                'deposit_amount' => (float) $this->deposit_amount,
            ],

            'status' => [
                'value' => $this->status->value,
                'label' => $this->status->label(),
                'is_blocking' => $this->status->isBlocking(),
            ],
            'source' => [
                'value' => $this->source->value,
                'label' => $this->source->label(),
            ],

            'notes' => $this->notes,
            'internal_notes' => $this->internal_notes,

            'cancelled_at' => $this->cancelled_at?->toIso8601String(),
            'cancelled_reason' => $this->cancelled_reason,

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
