<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Invoices\InvoiceService;
use App\Http\Controllers\Controller;
use App\Http\Resources\InvoiceCollection;
use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use App\Models\Rental;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class InvoiceController extends Controller
{
    public function __construct(
        private readonly InvoiceService $service,
    ) {}

    public function index(Request $request): InvoiceCollection
    {
        $query = Invoice::query()->with('customer');

        if ($request->filled('search')) {
            $search = strtolower(trim((string) $request->input('search')));
            $like = "%{$search}%";
            $query->where(function ($q) use ($like) {
                $q->whereRaw('LOWER(invoice_number) LIKE ?', [$like])
                  ->orWhereHas('customer', function ($cq) use ($like) {
                      $cq->whereRaw('LOWER(first_name) LIKE ?', [$like])
                         ->orWhereRaw('LOWER(last_name) LIKE ?', [$like])
                         ->orWhereRaw('LOWER(email) LIKE ?', [$like]);
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('rental_id')) {
            $query->where('rental_id', (int) $request->input('rental_id'));
        }

        if ($request->filled('customer_id')) {
            $query->where('customer_id', (int) $request->input('customer_id'));
        }

        $query->orderByDesc('created_at');
        $perPage = min((int) $request->input('per_page', 20), 100);

        return new InvoiceCollection($query->paginate($perPage));
    }

    /**
     * Gjeneron faturë nga një rental.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'rental_id' => ['required', 'integer', 'exists:rentals,id'],
        ]);

        $rental = Rental::with(['customer', 'vehicle'])->findOrFail($validated['rental_id']);

        // Nëse ka tashmë faturë për këtë rental, ktheje atë
        $existing = Invoice::where('rental_id', $rental->id)->first();
        if ($existing) {
            return (new InvoiceResource($existing->load('customer')))
                ->response()
                ->setStatusCode(200);
        }

        $invoice = $this->service->generateFromRental($rental, auth()->id());

        return (new InvoiceResource($invoice->load('customer')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Invoice $invoice): InvoiceResource
    {
        $invoice->load('customer');

        return new InvoiceResource($invoice);
    }

    /**
     * Kthen PDF-in e faturës.
     */
    public function pdf(Invoice $invoice): Response|JsonResponse
    {
        $contents = $this->service->getPdfContents($invoice);

        if (! $contents) {
            // Regjenero nëse mungon
            $this->service->regeneratePdf($invoice);
            $contents = $this->service->getPdfContents($invoice->fresh());
        }

        if (! $contents) {
            return response()->json(['message' => 'PDF nuk mund të gjenerohet.'], 500);
        }

        return response($contents, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "inline; filename=\"{$invoice->invoice_number}.pdf\"",
        ]);
    }

    /**
     * Rikrijon PDF-in (nëse ka ndryshuar ndonjë të dhënë).
     */
    public function regenerate(Invoice $invoice): InvoiceResource
    {
        $this->service->regeneratePdf($invoice);

        return new InvoiceResource($invoice->fresh()->load('customer'));
    }

    /**
     * Shënon faturën si të paguar.
     */
    public function markPaid(Invoice $invoice): InvoiceResource|JsonResponse
    {
        if ($invoice->status->value === 'cancelled') {
            return response()->json(['message' => 'Fatura është e anuluar.'], 409);
        }

        $invoice->update([
            'status' => \App\Enums\InvoiceStatus::PAID,
            'paid_at' => now(),
            'amount_paid' => $invoice->total,
            'amount_due' => 0,
        ]);

        return new InvoiceResource($invoice->fresh()->load('customer'));
    }
}
