<?php

namespace App\Models;

use App\Enums\MaintenanceStatus;
use App\Enums\MaintenanceType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceRecord extends Model
{
    use HasFactory;
    use \App\Domain\Audit\Auditable;

    protected $fillable = [
        'maintenance_code',
        'vehicle_id',
        'type',
        'status',
        'title',
        'description',
        'scheduled_at',
        'performed_at',
        'next_service_at',
        'mileage_at_service',
        'next_service_mileage',
        'cost',
        'provider_name',
        'provider_phone',
        'invoice_number',
        'blocks_vehicle',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'type' => MaintenanceType::class,
            'status' => MaintenanceStatus::class,
            'scheduled_at' => 'date',
            'performed_at' => 'date',
            'next_service_at' => 'date',
            'cost' => 'decimal:2',
            'blocks_vehicle' => 'boolean',
            'mileage_at_service' => 'integer',
            'next_service_mileage' => 'integer',
        ];
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function isOverdue(): bool
    {
        return $this->status === MaintenanceStatus::SCHEDULED
            && $this->scheduled_at
            && $this->scheduled_at->isPast();
    }

    public function daysUntilNextService(): ?int
    {
        if (! $this->next_service_at) {
            return null;
        }

        return (int) now()->startOfDay()->diffInDays(
            $this->next_service_at->copy()->startOfDay(),
            false,
        );
    }

    public function generateCode(): string
    {
        $year = now()->year;
        $prefix = "MNT-{$year}-";

        $last = static::query()
            ->where('maintenance_code', 'like', "{$prefix}%")
            ->orderByDesc('maintenance_code')
            ->lockForUpdate()
            ->value('maintenance_code');

        $next = 1;
        if ($last) {
            $next = (int) substr($last, strlen($prefix)) + 1;
        }

        return $prefix . str_pad($next, 4, '0', STR_PAD_LEFT);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', MaintenanceStatus::COMPLETED->value);
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', [
            MaintenanceStatus::SCHEDULED->value,
            MaintenanceStatus::IN_PROGRESS->value,
        ]);
    }
}
