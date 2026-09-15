<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'payment_code' => $this->payment_code,

            'payable' => [
                'type' => class_basename($this->payable_type),
                'id' => $this->payable_id,
            ],

            'customer' => new CustomerResource($this->whenLoaded('customer')),
            'received_by' => $this->whenLoaded('receivedBy', fn () => [
                'id' => $this->receivedBy->id,
                'name' => $this->receivedBy->name,
            ]),

            'type' => [
                'value' => $this->type->value,
                'label' => $this->type->label(),
                'is_incoming' => $this->type->isIncoming(),
            ],
            'method' => [
                'value' => $this->method->value,
                'label' => $this->method->label(),
            ],
            'status' => [
                'value' => $this->status->value,
                'label' => $this->status->label(),
            ],

            'amount' => (float) $this->amount,
            'refunded_amount' => (float) $this->refunded_amount,
            'net_amount' => $this->netAmount(),

            'reference' => $this->reference,
            'notes' => $this->notes,

            'paid_at' => $this->paid_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
