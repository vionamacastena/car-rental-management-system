<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Contracts\ContractService;
use App\Enums\ContractStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ContractCollection;
use App\Http\Resources\ContractResource;
use App\Models\Contract;
use App\Models\Rental;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ContractController extends Controller
{
    public function __construct(
        private readonly ContractService $service,
    ) {}

    public function index(Request $request): ContractCollection
    {
        $query = Contract::query()
            ->with(['customer', 'vehicle']);

        if ($request->filled('search')) {
            $search = strtolower(trim((string) $request->input('search')));
            $like = "%{$search}%";
            $query->where(function ($q) use ($like) {
                $q->whereRaw('LOWER(contract_number) LIKE ?', [$like])
                  ->orWhereHas('customer', function ($cq) use ($like) {
                      $cq->whereRaw('LOWER(first_name) LIKE ?', [$like])
                         ->orWhereRaw('LOWER(last_name) LIKE ?', [$like]);
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

        return new ContractCollection($query->paginate($perPage));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'rental_id' => ['required', 'integer', 'exists:rentals,id'],
        ]);

        $rental = Rental::with(['customer', 'vehicle'])->findOrFail($validated['rental_id']);

        $existing = Contract::where('rental_id', $rental->id)->first();
        if ($existing) {
            return (new ContractResource($existing->load(['customer', 'vehicle'])))
                ->response()
                ->setStatusCode(200);
        }

        $contract = $this->service->generateFromRental($rental, auth()->id());

        return (new ContractResource($contract->load(['customer', 'vehicle'])))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Contract $contract): ContractResource
    {
        $contract->load(['customer', 'vehicle', 'rental']);

        return new ContractResource($contract);
    }

    public function pdf(Contract $contract): Response|JsonResponse
    {
        $contents = $this->service->getPdfContents($contract);

        if (! $contents) {
            $this->service->regeneratePdf($contract);
            $contents = $this->service->getPdfContents($contract->fresh());
        }

        if (! $contents) {
            return response()->json(['message' => 'PDF nuk mund të gjenerohet.'], 500);
        }

        return response($contents, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "inline; filename=\"{$contract->contract_number}.pdf\"",
        ]);
    }

    public function regenerate(Contract $contract): ContractResource
    {
        $this->service->regeneratePdf($contract);

        return new ContractResource($contract->fresh()->load(['customer', 'vehicle']));
    }
}
