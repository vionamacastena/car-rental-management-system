<?php

namespace App\Models;

use App\Enums\FuelType;
use App\Enums\Transmission;
use App\Enums\VehicleStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'brand',
        'model',
        'year',
        'license_plate',
        'vin',
        'color',
        'mileage',
        'fuel_type',
        'transmission',
        'seats',
        'current_location_id',
        'status',
        'daily_price',
        'purchase_price',
        'current_value',
        'description',
        'features',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'mileage' => 'integer',
            'seats' => 'integer',
            'fuel_type' => FuelType::class,
            'transmission' => Transmission::class,
            'status' => VehicleStatus::class,
            'daily_price' => 'decimal:2',
            'purchase_price' => 'decimal:2',
            'current_value' => 'decimal:2',
            'features' => 'array',
        ];
    }

    public function currentLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'current_location_id');
    }

    public function photos(): HasMany
    {
        return $this->hasMany(VehiclePhoto::class)->orderBy('sort_order');
    }

    public function primaryPhoto()
    {
        return $this->hasOne(VehiclePhoto::class)->where('is_primary', true);
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', VehicleStatus::AVAILABLE->value);
    }

    public function fullName(): string
    {
        return "{$this->brand} {$this->model}";
    }
}
