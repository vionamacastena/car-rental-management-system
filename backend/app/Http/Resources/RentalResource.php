<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RentalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'rental_code' => $this->rental_code,

            'reservation' => new ReservationResource($this->whenLoaded('reservation')),
            'customer' => new CustomerResource($this->whenLoaded('customer')),
            'vehicle' => new VehicleResource($this->whenLoaded('vehicle')),
            'pickup_location' => new LocationResource($this->whenLoaded('pickupLocation')),
            'return_location' => new LocationResource($this->whenLoaded('returnLocation')),

            'planned_pickup_at' => $this->planned_pickup_at->toIso8601String(),
            'planned_return_at' => $this->planned_return_at->toIso8601String(),
            'actual_pickup_at' => $this->actual_pickup_at?->toIso8601String(),
            'actual_return_at' => $this->actual_return_at?->toIso8601String(),

            'status' => [
                'value' => $this->status->value,
                'label' => $this->status->label(),
                'is_open' => $this->status->isOpen(),
            ],

            'mileage' => [
                'pickup' => $this->pickup_mileage,
                'return' => $this->return_mileage,
                'limit' => $this->mileage_limit,
                'used' => $this->mileage_used,
            ],

            'fuel' => [
                'pickup_level' => $this->pickup_fuel_level,
                'return_level' => $this->return_fuel_level,
            ],

            'pricing' => [
                'base_amount' => (float) $this->base_amount,
                'extras_amount' => (float) $this->extras_amount,
                'fees_amount' => (float) $this->fees_amount,
                'taxes_amount' => (float) $this->taxes_amount,
                'discount_amount' => (float) $this->discount_amount,
                'damage_amount' => (float) $this->damage_amount,
                'extra_mileage_amount' => (float) $this->extra_mileage_amount,
                'fuel_amount' => (float) $this->fuel_amount,
                'late_return_amount' => (float) $this->late_return_amount,
                'other_charges_amount' => (float) $this->other_charges_amount,
                'total_amount' => (float) $this->total_amount,
                'deposit_amount' => (float) $this->deposit_amount,
                'deposit_deduction' => (float) $this->deposit_deduction,
                'deposit_refund' => (float) $this->deposit_refund,
            ],

            'checkout' => [
                'condition' => $this->checkout_condition,
                'notes' => $this->checkout_notes,
                'signature' => $this->checkout_signature,
                'checked_out_at' => $this->checked_out_at?->toIso8601String(),
            ],

            'checkin' => [
                'condition' => $this->checkin_condition,
                'notes' => $this->checkin_notes,
                'signature' => $this->checkin_signature,
                'checked_in_at' => $this->checked_in_at?->toIso8601String(),
            ],

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
