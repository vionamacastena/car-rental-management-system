<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'action' => $this->action,
            'entity' => [
                'type' => $this->entity_type,
                'short_name' => $this->entityShortName(),
                'id' => $this->entity_id,
                'label' => $this->entity_label,
            ],
            'user' => [
                'id' => $this->user_id,
                'name' => $this->user_name,
                'email' => $this->user_email,
            ],
            'old_values' => $this->old_values,
            'new_values' => $this->new_values,
            'changed_fields' => $this->changedFields(),
            'description' => $this->description,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'url' => $this->url,
            'method' => $this->method,
            'created_at' => $this->created_at->toIso8601String(),
            'human_time' => $this->created_at->diffForHumans(),
        ];
    }
}
