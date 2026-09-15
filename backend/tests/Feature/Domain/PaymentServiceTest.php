<?php

use App\Domain\Payments\PaymentService;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Models\Payment;
use App\Models\Rental;
use Illuminate\Support\Facades\DB;

beforeEach(function () {
    $this->service = app(PaymentService::class);
});

it('registers a payment', function () {
    $rental = Rental::factory()->create();

    $payment = $this->service->register($rental, [
        'type' => PaymentType::RENTAL_PAYMENT->value,
        'method' => 'cash',
        'amount' => 250,
    ]);

    expect($payment)->toBeInstanceOf(Payment::class);
    expect($payment->payment_code)->toStartWith('PAY-' . now()->year . '-');
    expect((float) $payment->amount)->toBe(250.00);
    expect($payment->status)->toBe(PaymentStatus::COMPLETED);
});

it('registers sequential payment codes', function () {
    $r1 = Rental::factory()->create();
    $r2 = Rental::factory()->create();

    $p1 = $this->service->register($r1, ['type' => 'rental_payment', 'method' => 'cash', 'amount' => 100]);
    $p2 = $this->service->register($r2, ['type' => 'rental_payment', 'method' => 'cash', 'amount' => 200]);

    expect($p1->payment_code)->toBe('PAY-' . now()->year . '-0001');
    expect($p2->payment_code)->toBe('PAY-' . now()->year . '-0002');
});

it('refunds full payment', function () {
    $rental = Rental::factory()->create();
    $original = $this->service->register($rental, [
        'type' => 'deposit_received',
        'method' => 'cash',
        'amount' => 300,
    ]);

    $refund = $this->service->refund($original, 300, ['notes' => 'Klienti ktheu depozitën']);

    expect($refund->payment_code)->toStartWith('REF-' . now()->year . '-');
    expect($refund->type)->toBe(PaymentType::DEPOSIT_REFUND);
    expect((float) $refund->amount)->toBe(300.00);

    expect($original->fresh()->status)->toBe(PaymentStatus::REFUNDED);
    expect((float) $original->fresh()->refunded_amount)->toBe(300.00);
});

it('refunds partial amount', function () {
    $rental = Rental::factory()->create();
    $original = $this->service->register($rental, [
        'type' => 'deposit_received',
        'method' => 'cash',
        'amount' => 300,
    ]);

    $this->service->refund($original, 120, ['notes' => 'Dëmtim']);

    expect($original->fresh()->status)->toBe(PaymentStatus::PARTIALLY_REFUNDED);
    expect((float) $original->fresh()->refunded_amount)->toBe(120.00);
});

it('rejects refund that exceeds remaining amount', function () {
    $rental = Rental::factory()->create();
    $payment = $this->service->register($rental, ['type' => 'rental_payment', 'method' => 'cash', 'amount' => 100]);

    expect(fn () => $this->service->refund($payment, 200))
        ->toThrow(RuntimeException::class);
});

it('rejects refunding an already refunded payment', function () {
    $rental = Rental::factory()->create();
    $payment = $this->service->register($rental, ['type' => 'deposit_received', 'method' => 'cash', 'amount' => 300]);

    $this->service->refund($payment, 300);

    expect(fn () => $this->service->refund($payment->fresh(), 50))
        ->toThrow(RuntimeException::class);
});

it('generates summary for payable', function () {
    $rental = Rental::factory()->create();

    $this->service->register($rental, ['type' => 'rental_payment', 'method' => 'cash', 'amount' => 250]);
    $this->service->register($rental, ['type' => 'deposit_received', 'method' => 'cash', 'amount' => 300]);

    $summary = $this->service->summary($rental);

    expect($summary['total_paid'])->toBe(550.00);
    expect($summary['total_refunded'])->toBe(0.0);
    expect($summary['net_received'])->toBe(550.00);
});

it('accounts for refunds in summary', function () {
    $rental = Rental::factory()->create();

    $this->service->register($rental, ['type' => 'rental_payment', 'method' => 'cash', 'amount' => 250]);
    $deposit = $this->service->register($rental, ['type' => 'deposit_received', 'method' => 'cash', 'amount' => 300]);
    $this->service->refund($deposit, 300);

    $summary = $this->service->summary($rental);

    // 250 rental + 300 deposit - 300 refund = 250
    expect($summary['total_paid'])->toBe(250.00);
    expect($summary['total_refunded'])->toBe(300.00);
    expect($summary['net_received'])->toBe(-50.00);
});

it('settles deposit with refund and deduction', function () {
    $rental = Rental::factory()->create([
        'rental_code' => 'RNT-2026-0001',
        'deposit_amount' => 300,
    ]);

    $created = $this->service->settleDeposit($rental, deduction: 120, refund: 180);

    expect($created['deduction_payment'])->not->toBeNull();
    expect($created['refund_payment'])->not->toBeNull();

    expect((float) $created['deduction_payment']->amount)->toBe(120.0);
    expect((float) $created['refund_payment']->amount)->toBe(180.0);

    expect($created['deduction_payment']->type)->toBe(\App\Enums\PaymentType::EXTRA_CHARGE);
    expect($created['refund_payment']->type)->toBe(\App\Enums\PaymentType::DEPOSIT_REFUND);
});

it('settles deposit with only refund', function () {
    $rental = Rental::factory()->create(['rental_code' => 'RNT-2026-0002']);

    $created = $this->service->settleDeposit($rental, deduction: 0, refund: 300);

    expect($created['deduction_payment'])->toBeNull();
    expect($created['refund_payment'])->not->toBeNull();
    expect((float) $created['refund_payment']->amount)->toBe(300.0);
});

it('settles deposit with only deduction', function () {
    $rental = Rental::factory()->create(['rental_code' => 'RNT-2026-0003']);

    $created = $this->service->settleDeposit($rental, deduction: 200, refund: 0);

    expect($created['deduction_payment'])->not->toBeNull();
    expect($created['refund_payment'])->toBeNull();
});

it('does not create payments when both amounts are zero', function () {
    $rental = Rental::factory()->create();

    $created = $this->service->settleDeposit($rental, deduction: 0, refund: 0);

    expect($created['deduction_payment'])->toBeNull();
    expect($created['refund_payment'])->toBeNull();
});
