<?php

namespace App\Models;

use App\Enums\ReservationSource;
use App\Enums\ReservationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reservation extends Model
{
    use HasFactory;
    use \App\Domain\Audit\Auditable;

    protected $fillable = [
        'reservation_code',
        'customer_id',
        'vehicle_id',
        'pickup_location_id',
        'return_location_id',
        'pickup_at',
        'return_at',
        'days',
        'daily_price_snapshot',
        'subtotal',
        'extras_total',
        'fees_total',
        'taxes_total',
        'discount_total',
        'total',
        'deposit_amount',
        'status',
        'source',
        'notes',
        'internal_notes',
        'cancelled_at',
        'cancelled_reason',
    ];

    protected function casts(): array
    {
        return [
            'pickup_at' => 'datetime',
            'return_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'status' => ReservationStatus::class,
            'source' => ReservationSource::class,
            'days' => 'integer',
            'daily_price_snapshot' => 'decimal:2',
            'subtotal' => 'decimal:2',
            'extras_total' => 'decimal:2',
            'fees_total' => 'decimal:2',
            'taxes_total' => 'decimal:2',
            'discount_total' => 'decimal:2',
            'total' => 'decimal:2',
            'deposit_amount' => 'decimal:2',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function pickupLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'pickup_location_id');
    }

    public function returnLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'return_location_id');
    }

    /**
     * Gjeneron kod unik rezervimi: RES-YYYY-NNNN
     * Duhet thirrur brenda një transaction për të shmangur race.
     */
    public static function generateCode(): string
    {
        $year = now()->year;
        $prefix = "RES-{$year}-";

        $lastCode = static::query()
            ->where('reservation_code', 'like', "{$prefix}%")
            ->orderByDesc('reservation_code')
            ->lockForUpdate()
            ->value('reservation_code');

        $nextNumber = 1;
        if ($lastCode) {
            $nextNumber = (int) substr($lastCode, strlen($prefix)) + 1;
        }

        return $prefix . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }

    public function isBlocking(): bool
    {
        return $this->status->isBlocking();
    }

    public function scopeBlocking($query)
    {
        return $query->whereIn('status', ReservationStatus::blockingValues());
    }
}
