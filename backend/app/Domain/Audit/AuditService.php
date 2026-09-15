<?php

namespace App\Domain\Audit;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditService
{
    /**
     * Regjistron një veprim audit-i.
     */
    public function log(
        string $action,
        Model $entity,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?string $description = null,
        ?string $entityLabel = null,
    ): AuditLog {
        $user = Auth::user();
        $request = Request::instance();

        return AuditLog::create([
            'user_id' => $user?->id,
            'user_name' => $user?->name,
            'user_email' => $user?->email,
            'action' => $action,
            'entity_type' => get_class($entity),
            'entity_id' => $entity->getKey(),
            'entity_label' => $entityLabel ?? $this->buildLabel($entity),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'description' => $description,
            'created_at' => now(),
        ]);
    }

    /**
     * Ndërton një label të lexueshme për entitetin.
     */
    private function buildLabel(Model $entity): ?string
    {
        return match (class_basename($entity)) {
            'Vehicle' => "{$entity->brand} {$entity->model} ({$entity->license_plate})",
            'Customer' => $entity->fullName(),
            'Reservation' => $entity->reservation_code,
            'Rental' => $entity->rental_code,
            'Payment' => $entity->payment_code,
            'Invoice' => $entity->invoice_number,
            'Contract' => $entity->contract_number,
            'MaintenanceRecord' => $entity->maintenance_code,
            'Location' => $entity->name,
            default => "#{$entity->getKey()}",
        };
    }
}
