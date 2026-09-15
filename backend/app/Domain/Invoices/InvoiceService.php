<?php

namespace App\Domain\Invoices;

use App\Enums\InvoiceStatus;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Rental;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class InvoiceService
{
    /**
     * Gjeneron faturë nga një rental me line items.
     */
    public function generateFromRental(Rental $rental, ?int $createdBy = null): Invoice
    {
        return DB::transaction(function () use ($rental, $createdBy) {
            $lineItems = $this->buildLineItems($rental);
            $subtotal = collect($lineItems)->sum('total');

            // VAT 18% (Kosovo) — konfigurohet në Fazën 8 kur të bëjmë Settings
            $taxRate = 0.18;
            $taxAmount = round($subtotal * $taxRate, 2);
            $total = round($subtotal + $taxAmount, 2);

            // Sa është paguar
            $paid = Payment::where('payable_type', Rental::class)
                ->where('payable_id', $rental->id)
                ->where('status', PaymentStatus::COMPLETED)
                ->get()
                ->sum(function (Payment $p) {
                    return $p->type->isIncoming()
                        ? (float) $p->amount - (float) $p->refunded_amount
                        : -(float) $p->amount;
                });

            $invoice = Invoice::create([
                'invoice_number' => (new Invoice)->generateNumber(),
                'rental_id' => $rental->id,
                'customer_id' => $rental->customer_id,
                'status' => InvoiceStatus::ISSUED,
                'line_items' => $lineItems,
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'total' => $total,
                'amount_paid' => round(max(0, $paid), 2),
                'amount_due' => round(max(0, $total - $paid), 2),
                'issued_at' => now(),
                'due_at' => now()->addDays(14),
                'created_by' => $createdBy,
            ]);

            // Gjenero PDF
            $this->regeneratePdf($invoice);

            return $invoice->fresh();
        });
    }

    /**
     * Rikrijon PDF-in për një faturë ekzistuese.
     */
    public function regeneratePdf(Invoice $invoice): string
    {
        $invoice->load(['rental.vehicle', 'rental.pickupLocation', 'rental.returnLocation', 'customer']);

        $pdf = Pdf::loadView('invoices.show', [
            'invoice' => $invoice,
            'rental' => $invoice->rental,
            'customer' => $invoice->customer,
        ])->setPaper('a4');

        $path = "invoices/{$invoice->invoice_number}.pdf";
        Storage::disk('local')->put($path, $pdf->output());

        $invoice->update(['pdf_path' => $path]);

        return $path;
    }

    /**
     * Kthen PDF-in si binary ose null.
     */
    public function getPdfContents(Invoice $invoice): ?string
    {
        if (! $invoice->pdf_path || ! Storage::disk('local')->exists($invoice->pdf_path)) {
            return null;
        }

        return Storage::disk('local')->get($invoice->pdf_path);
    }

    /**
     * Ndërton line items nga rental.
     */
    private function buildLineItems(Rental $rental): array
    {
        $items = [];

        $days = max(1, (int) ceil(
            $rental->planned_pickup_at->diffInHours($rental->planned_return_at) / 24
        ));

        // Base rental
        $baseDaily = $rental->base_amount > 0 && $days > 0
            ? round((float) $rental->base_amount / $days, 2)
            : 0;

        $items[] = [
            'label' => "Qiraja e automjetit — {$rental->vehicle->full_name}",
            'description' => "{$days} ditë × {$baseDaily}€ / ditë",
            'qty' => $days,
            'unit_price' => $baseDaily,
            'total' => (float) $rental->base_amount,
        ];

        if ((float) $rental->extras_amount > 0) {
            $items[] = [
                'label' => 'Pajisje / extras',
                'description' => null,
                'qty' => 1,
                'unit_price' => (float) $rental->extras_amount,
                'total' => (float) $rental->extras_amount,
            ];
        }

        if ((float) $rental->fees_amount > 0) {
            $items[] = [
                'label' => 'Tarifa shtesë',
                'description' => null,
                'qty' => 1,
                'unit_price' => (float) $rental->fees_amount,
                'total' => (float) $rental->fees_amount,
            ];
        }

        if ((float) $rental->fuel_amount > 0) {
            $items[] = [
                'label' => 'Karburant',
                'description' => 'Rimbushje karburanti',
                'qty' => 1,
                'unit_price' => (float) $rental->fuel_amount,
                'total' => (float) $rental->fuel_amount,
            ];
        }

        if ((float) $rental->damage_amount > 0) {
            $items[] = [
                'label' => 'Dëmtim automjeti',
                'description' => null,
                'qty' => 1,
                'unit_price' => (float) $rental->damage_amount,
                'total' => (float) $rental->damage_amount,
            ];
        }

        if ((float) $rental->extra_mileage_amount > 0) {
            $items[] = [
                'label' => 'Kilometrazh shtesë',
                'description' => "Totali: {$rental->mileage_used} km",
                'qty' => 1,
                'unit_price' => (float) $rental->extra_mileage_amount,
                'total' => (float) $rental->extra_mileage_amount,
            ];
        }

        if ((float) $rental->late_return_amount > 0) {
            $items[] = [
                'label' => 'Kthim me vonesë',
                'description' => null,
                'qty' => 1,
                'unit_price' => (float) $rental->late_return_amount,
                'total' => (float) $rental->late_return_amount,
            ];
        }

        if ((float) $rental->other_charges_amount > 0) {
            $items[] = [
                'label' => 'Tarifa të tjera',
                'description' => null,
                'qty' => 1,
                'unit_price' => (float) $rental->other_charges_amount,
                'total' => (float) $rental->other_charges_amount,
            ];
        }

        if ((float) $rental->discount_amount > 0) {
            $items[] = [
                'label' => 'Zbritje',
                'description' => null,
                'qty' => 1,
                'unit_price' => -(float) $rental->discount_amount,
                'total' => -(float) $rental->discount_amount,
            ];
        }

        return $items;
    }
}
