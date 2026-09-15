<?php

use App\Domain\Rentals\ChargeCalculator;
use App\Models\Rental;

beforeEach(function () {
    $this->calc = app(ChargeCalculator::class);
});

it('calculates mileage used correctly', function () {
    $rental = Rental::factory()->create([
        'pickup_mileage' => 10000,
        'base_amount' => 250,
        'total_amount' => 250,
    ]);

    $charges = $this->calc->calculateAdditionalCharges($rental, [
        'return_mileage' => 10650,
    ]);

    expect($charges['mileage_used'])->toBe(650);
});

it('calculates total with all charges', function () {
    $rental = Rental::factory()->create([
        'base_amount' => 250,
        'extras_amount' => 50,
        'fees_amount' => 10,
        'taxes_amount' => 30,
        'discount_amount' => 20,
        'pickup_mileage' => 10000,
    ]);

    $charges = $this->calc->calculateAdditionalCharges($rental, [
        'return_mileage' => 11000,
        'fuel_charge' => 40,
        'damage_charge' => 120,
        'extra_mileage_charge' => 30,
        'late_return_charge' => 25,
        'other_charges' => 15,
    ]);

    // 250 + 50 + 10 + 30 - 20 + 40 + 120 + 30 + 25 + 15 = 550
    expect($charges['total_amount'])->toBe(550.00);
    expect($charges['fuel_amount'])->toBe(40.0);
    expect($charges['damage_amount'])->toBe(120.0);
});

it('handles zero charges', function () {
    $rental = Rental::factory()->create([
        'base_amount' => 250,
        'pickup_mileage' => 10000,
    ]);

    $charges = $this->calc->calculateAdditionalCharges($rental, [
        'return_mileage' => 10500,
    ]);

    expect($charges['total_amount'])->toBe(250.00);
});

it('calculates deposit settlement with damage', function () {
    $rental = Rental::factory()->create([
        'deposit_amount' => 300,
    ]);

    $settlement = $this->calc->calculateDepositSettlement($rental, [
        'fuel_amount' => 0,
        'damage_amount' => 120,
        'extra_mileage_amount' => 0,
        'late_return_amount' => 0,
        'other_charges_amount' => 0,
    ]);

    expect($settlement['deposit_deduction'])->toBe(120.00);
    expect($settlement['deposit_refund'])->toBe(180.00);
});

it('calculates deposit refund when no charges', function () {
    $rental = Rental::factory()->create(['deposit_amount' => 300]);

    $settlement = $this->calc->calculateDepositSettlement($rental, [
        'fuel_amount' => 0, 'damage_amount' => 0,
        'extra_mileage_amount' => 0, 'late_return_amount' => 0,
        'other_charges_amount' => 0,
    ]);

    expect($settlement['deposit_deduction'])->toBe(0.0);
    expect($settlement['deposit_refund'])->toBe(300.0);
});

it('does not allow negative refund', function () {
    $rental = Rental::factory()->create(['deposit_amount' => 200]);

    $settlement = $this->calc->calculateDepositSettlement($rental, [
        'fuel_amount' => 50, 'damage_amount' => 500,
        'extra_mileage_amount' => 0, 'late_return_amount' => 0,
        'other_charges_amount' => 0,
    ]);

    expect($settlement['deposit_deduction'])->toBe(550.0);
    expect($settlement['deposit_refund'])->toBe(0.0); // max(0, 200-550)
});
