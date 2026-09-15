<?php

namespace App\Models;

use App\Enums\RentalStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Rental extends Model
{
    use HasFactory;

    protected $fillable = [
        'rental_code',
        'reservation_id',
        'customer_id',
        'vehicle_id',
        'pickup_location_id',
        'return_location_id',
        'planned_pickup_at',
        'planned_return_at',
        'actual_pickup_at',
        'actual_return_at',
        'status',
        'pickup_mileage',
        'return_mileage',
        'mileage_limit',
        'mileage_used',
        'pickup_fuel_level',
        'return_fuel_level',
        'base_amount',
        'extras_amount',
        'fees_amount',
        'taxes_amount',
        'discount_amount',
        'damage_amount',
        'extra_mileage_amount',
        'fuel_amount',
        'late_return_amount',
        'other_charges_amount',
        'total_amount',
        'deposit_amount',
        'deposit_deduction',
        'deposit_refund',
        'checkout_condition',
        'checkout_notes',
        'checkout_signature',
        'checked_out_at',
        'checkin_condition',
        'checkin_notes',
        'checkin_signature',
        'checked_in_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => RentalStatus::class,
            'planned_pickup_at' => 'datetime',
            'planned_return_at' => 'datetime',
            'actual_pickup_at' => 'datetime',
            'actual_return_at' => 'datetime',
            'checked_out_at' => 'datetime',
            'checked_in_at' => 'datetime',
            'checkout_condition' => 'array',
            'checkin_condition' => 'array',
            'pickup_mileage' => 'integer',
            'return_mileage' => 'integer',
            'mileage_limit' => 'integer',
            'mileage_used' => 'integer',
            'pickup_fuel_level' => 'integer',
            'return_fuel_level' => 'integer',
            'base_amount' => 'decimal:2',
            'extras_amount' => 'decimal:2',
            'fees_amount' => 'decimal:2',
            'taxes_amount' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'damage_amount' => 'decimal:2',
            'extra_mileage_amount' => 'decimal:2',
            'fuel_amount' => 'decimal:2',
            'late_return_amount' => 'decimal:2',
            'other_charges_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'deposit_amount' => 'decimal:2',
            'deposit_deduction' => 'decimal:2',
            'deposit_refund' => 'decimal:2',
        ];
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
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

    public function generateCode(): string
    {
        $year = now()->year;
        $prefix = "RNT-{$year}-";

        $lastCode = static::query()
            ->where('rental_code', 'like', "{$prefix}%")
            ->orderByDesc('rental_code')
            ->lockForUpdate()
            ->value('rental_code');

        $next = 1;
        if ($lastCode) {
            $next = (int) substr($lastCode, strlen($prefix)) + 1;
        }

        return $prefix . str_pad($next, 4, '0', STR_PAD_LEFT);
    }

    public function scopeOpen($query)
    {
        return $query->whereIn('status', [
            RentalStatus::PENDING_CHECKOUT->value,
            RentalStatus::ACTIVE->value,
            RentalStatus::PENDING_CHECKIN->value,
        ]);
    }
}
