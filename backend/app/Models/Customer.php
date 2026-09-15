<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;
    use \App\Domain\Audit\Auditable;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'address',
        'city',
        'country',
        'date_of_birth',
        'driver_license_number',
        'driver_license_expiry',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'driver_license_expiry' => 'date',
        ];
    }

    public function fullName(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    /**
     * Gjej klient ekzistues ose krijo të re.
     * Match key: email + phone (case-insensitive për email).
     */
    public static function findOrCreateFromBooking(array $data): self
    {
        $email = strtolower(trim($data['email']));

        $existing = static::query()
            ->whereRaw('LOWER(email) = ?', [$email])
            ->where('phone', $data['phone'])
            ->first();

        if ($existing) {
            // Përditëso emrin nëse ka ndryshuar
            $existing->update([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'address' => $data['address'] ?? $existing->address,
                'city' => $data['city'] ?? $existing->city,
                'country' => $data['country'] ?? $existing->country,
            ]);
            return $existing;
        }

        return static::create($data);
    }
}
