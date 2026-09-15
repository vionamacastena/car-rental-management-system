<?php

namespace App\Models;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Payment extends Model
{
    use HasFactory;
    use \App\Domain\Audit\Auditable;

    protected $fillable = [
        'payment_code',
        'payable_type',
        'payable_id',
        'customer_id',
        'type',
        'method',
        'status',
        'amount',
        'refunded_amount',
        'reference',
        'notes',
        'paid_at',
        'received_by',
    ];

    protected function casts(): array
    {
        return [
            'type' => PaymentType::class,
            'method' => PaymentMethod::class,
            'status' => PaymentStatus::class,
            'amount' => 'decimal:2',
            'refunded_amount' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    public function payable(): MorphTo
    {
        return $this->morphTo();
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function receivedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function netAmount(): float
    {
        return (float) $this->amount - (float) $this->refunded_amount;
    }

    /**
     * Gjeneron kod unik: PAY-YYYY-NNNN ose REF-YYYY-NNNN për refund.
     */
    public function generateCode(PaymentType $type): string
    {
        $prefix = $type->isOutgoing() ? 'REF' : 'PAY';
        $year = now()->year;
        $fullPrefix = "{$prefix}-{$year}-";

        $lastCode = static::query()
            ->where('payment_code', 'like', "{$fullPrefix}%")
            ->orderByDesc('payment_code')
            ->lockForUpdate()
            ->value('payment_code');

        $next = 1;
        if ($lastCode) {
            $next = (int) substr($lastCode, strlen($fullPrefix)) + 1;
        }

        return $fullPrefix . str_pad($next, 4, '0', STR_PAD_LEFT);
    }
}
