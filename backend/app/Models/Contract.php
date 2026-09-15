<?php

namespace App\Models;

use App\Enums\ContractStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contract extends Model
{
    use HasFactory;

    protected $fillable = [
        'contract_number',
        'rental_id',
        'customer_id',
        'vehicle_id',
        'status',
        'contract_version',
        'terms_snapshot',
        'customer_signature',
        'admin_signature',
        'customer_signed_at',
        'admin_signed_at',
        'customer_signed_ip',
        'admin_signed_ip',
        'pdf_path',
        'notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'status' => ContractStatus::class,
            'terms_snapshot' => 'array',
            'contract_version' => 'integer',
            'customer_signed_at' => 'datetime',
            'admin_signed_at' => 'datetime',
        ];
    }

    public function rental(): BelongsTo
    {
        return $this->belongsTo(Rental::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function isFullySigned(): bool
    {
        return $this->customer_signature !== null
            && $this->admin_signature !== null;
    }

    public function generateNumber(): string
    {
        $year = now()->year;
        $prefix = "CON-{$year}-";

        $last = static::query()
            ->where('contract_number', 'like', "{$prefix}%")
            ->orderByDesc('contract_number')
            ->lockForUpdate()
            ->value('contract_number');

        $next = 1;
        if ($last) {
            $next = (int) substr($last, strlen($prefix)) + 1;
        }

        return $prefix . str_pad($next, 4, '0', STR_PAD_LEFT);
    }
}
