<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'documentable' => [
                'type' => class_basename($this->documentable_type),
                'id' => $this->documentable_id,
            ],
            'type' => [
                'value' => $this->type->value,
                'label' => $this->type->label(),
            ],
            'title' => $this->title,
            'description' => $this->description,
            'file_name' => $this->file_name,
            'mime_type' => $this->mime_type,
            'file_size' => $this->file_size,
            'human_size' => $this->humanSize(),
            'metadata' => $this->metadata,
            'expires_at' => $this->expires_at?->toDateString(),
            'is_expired' => $this->isExpired(),
            'expires_in_days' => $this->expiresInDays(),
            'is_confidential' => $this->is_confidential,
            'download_url' => url("/api/v1/admin/documents/{$this->id}/download"),
            'uploaded_by' => $this->whenLoaded('uploadedBy', fn () => [
                'id' => $this->uploadedBy->id,
                'name' => $this->uploadedBy->name,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
