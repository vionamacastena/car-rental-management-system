<?php

namespace App\Domain\Payments;

use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class PaymentService
{
    /**
     * Regjistron një pagesë të re.
     */
    public function register(Model $payable, array $data, ?int $receivedBy = null): Payment
    {
        return DB::transaction(function () use ($payable, $data, $receivedBy) {
            $type = PaymentType::from($data['type']);

            $payment = Payment::create([
                'payment_code' => (new Payment)->generateCode($type),
                'payable_type' => get_class($payable),
                'payable_id' => $payable->id,
                'customer_id' => $payable->customer_id,
                'type' => $type,
                'method' => $data['method'],
                'status' => $data['status'] ?? PaymentStatus::COMPLETED,
                'amount' => $data['amount'],
                'reference' => $data['reference'] ?? null,
                'notes' => $data['notes'] ?? null,
                'paid_at' => $data['paid_at'] ?? now(),
                'received_by' => $receivedBy,
            ]);

            return $payment;
        });
    }

    /**
     * Regjistron një refund total ose të pjesshëm të një pagese.
     * Krijon një payment të ri me tip REFUND/DEPOSIT_REFUND.
     */
    public function refund(Payment $original, float $amount, array $data = [], ?int $receivedBy = null): Payment
    {
        return DB::transaction(function () use ($original, $amount, $data, $receivedBy) {
            if (! $original->status->isFinal() || $original->status === PaymentStatus::REFUNDED) {
                throw new RuntimeException('Kjo pagesë nuk mund të rimbursohet.');
            }

            $remaining = (float) $original->amount - (float) $original->refunded_amount;
            if ($amount <= 0 || $amount > $remaining) {
                throw new RuntimeException("Shuma e rimbursimit duhet të jetë mes 0 dhe {$remaining}€.");
            }

            $refundType = $original->type === PaymentType::DEPOSIT_RECEIVED
                ? PaymentType::DEPOSIT_REFUND
                : PaymentType::REFUND;

            $refund = Payment::create([
                'payment_code' => (new Payment)->generateCode($refundType),
                'payable_type' => $original->payable_type,
                'payable_id' => $original->payable_id,
                'customer_id' => $original->customer_id,
                'type' => $refundType,
                'method' => $data['method'] ?? $original->method,
                'status' => PaymentStatus::COMPLETED,
                'amount' => $amount,
                'reference' => $data['reference'] ?? null,
                'notes' => $data['notes'] ?? "Rimbursim i {$original->payment_code}",
                'paid_at' => now(),
                'received_by' => $receivedBy,
            ]);

            // Update original
            $newRefundedTotal = (float) $original->refunded_amount + $amount;
            $original->update([
                'refunded_amount' => $newRefundedTotal,
                'status' => $newRefundedTotal >= (float) $original->amount
                    ? PaymentStatus::REFUNDED
                    : PaymentStatus::PARTIALLY_REFUNDED,
            ]);

            return $refund;
        });
    }

    /**
     * Gjendja financiare për një payable (rental/reservation).
     */
    public function summary(Model $payable): array
    {
        $payments = Payment::query()
            ->where('payable_type', get_class($payable))
            ->where('payable_id', $payable->id)
            ->where('status', PaymentStatus::COMPLETED)
            ->get();

        $incoming = $payments
            ->filter(fn (Payment $p) => $p->type->isIncoming())
            ->sum(fn (Payment $p) => (float) $p->amount - (float) $p->refunded_amount);

        $outgoing = $payments
            ->filter(fn (Payment $p) => $p->type->isOutgoing())
            ->sum(fn (Payment $p) => (float) $p->amount);

        return [
            'total_paid' => round((float) $incoming, 2),
            'total_refunded' => round((float) $outgoing, 2),
            'net_received' => round((float) $incoming - (float) $outgoing, 2),
            'by_type' => $payments->groupBy(fn (Payment $p) => $p->type->value)
                ->map(fn ($group) => round($group->sum('amount'), 2))
                ->all(),
        ];
    }
    /**
 * Settle-on depozitën pas check-in.
 * Krijon:
 *   - EXTRA_CHARGE për deduction (money kept from deposit)
 *   - DEPOSIT_REFUND për refund (money returned)
 */
    public function settleDeposit(
    \App\Models\Rental $rental,
    float $deduction,
    float $refund,
    ?string $refundMethod = null,
    ?int $receivedBy = null,
): array {
    $created = [
        'deduction_payment' => null,
        'refund_payment' => null,
    ];

    if ($deduction > 0) {
        $created['deduction_payment'] = $this->register($rental, [
            'type' => \App\Enums\PaymentType::EXTRA_CHARGE->value,
            'method' => \App\Enums\PaymentMethod::OTHER->value,
            'amount' => $deduction,
            'notes' => "Zbritje nga depozita për {$rental->rental_code}",
        ], $receivedBy);
    }

    if ($refund > 0) {
        $created['refund_payment'] = $this->register($rental, [
            'type' => \App\Enums\PaymentType::DEPOSIT_REFUND->value,
            'method' => $refundMethod ?? \App\Enums\PaymentMethod::CASH->value,
            'amount' => $refund,
            'notes' => "Rimbursim depozite për {$rental->rental_code}",
        ], $receivedBy);
    }

    return $created;
}
}
