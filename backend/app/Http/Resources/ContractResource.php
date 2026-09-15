<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContractResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'contract_number' => $this->contract_number,
            'status' => [
                'value' => $this->status->value,
                'label' => $this->status->label(),
                'is_signed' => $this->status->isSigned(),
            ],
            'contract_version' => $this->contract_version,

            'rental_id' => $this->rental_id,
            'customer' => new CustomerResource($this->whenLoaded('customer')),
            'vehicle' => new VehicleResource($this->whenLoaded('vehicle')),

            'terms_snapshot' => $this->terms_snapshot,

            'signatures' => [
                'customer_signed' => $this->customer_signature !== null,
                'customer_signed_at' => $this->customer_signed_at?->toIso8601String(),
                'admin_signed' => $this->admin_signature !== null,
                'admin_signed_at' => $this->admin_signed_at?->toIso8601String(),
                'fully_signed' => $this->isFullySigned(),
            ],

            'has_pdf' => ! empty($this->pdf_path),
            'download_url' => $this->pdf_path
                ? url("/api/v1/admin/contracts/{$this->id}/pdf")
                : null,

            'notes' => $this->notes,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
