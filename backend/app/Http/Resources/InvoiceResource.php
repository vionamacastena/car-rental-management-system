<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_number' => $this->invoice_number,
            'status' => [
                'value' => $this->status->value,
                'label' => $this->status->label(),
            ],
            'rental_id' => $this->rental_id,
            'customer' => new CustomerResource($this->whenLoaded('customer')),
            'line_items' => $this->line_items,
            'subtotal' => (float) $this->subtotal,
            'tax_amount' => (float) $this->tax_amount,
            'total' => (float) $this->total,
            'amount_paid' => (float) $this->amount_paid,
            'amount_due' => (float) $this->amount_due,
            'has_pdf' => ! empty($this->pdf_path),
            'download_url' => $this->pdf_path
                ? url("/api/v1/admin/invoices/{$this->id}/pdf")
                : null,
            'issued_at' => $this->issued_at?->toIso8601String(),
            'due_at' => $this->due_at?->toIso8601String(),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
