<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Rentals\RentalService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\CheckinRentalRequest;
use App\Http\Requests\Api\V1\Admin\CheckoutRentalRequest;
use App\Http\Requests\Api\V1\Admin\StartRentalRequest;
use App\Http\Resources\RentalCollection;
use App\Http\Resources\RentalResource;
use App\Models\Rental;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class RentalController extends Controller
{
    public function __construct(
        private readonly RentalService $service,
    ) {}

    public function index(Request $request): RentalCollection
    {
        $query = Rental::query()
            ->with(['customer', 'vehicle', 'pickupLocation', 'returnLocation', 'reservation']);

        if ($request->filled('search')) {
            $search = strtolower(trim((string) $request->input('search')));
            $like = "%{$search}%";
            $query->where(function ($q) use ($like) {
                $q->whereRaw('LOWER(rental_code) LIKE ?', [$like])
                  ->orWhereHas('customer', function ($cq) use ($like) {
                      $cq->whereRaw('LOWER(first_name) LIKE ?', [$like])
                         ->orWhereRaw('LOWER(last_name) LIKE ?', [$like])
                         ->orWhereRaw('LOWER(email) LIKE ?', [$like]);
                  });
            });
        }

        if ($request->filled('status')) {
            $statuses = (array) $request->input('status');
            $query->whereIn('status', $statuses);
        }

        if ($request->filled('vehicle_id')) {
            $query->where('vehicle_id', (int) $request->input('vehicle_id'));
        }

        if ($request->boolean('open_only')) {
            $query->open();
        }

        $sortBy = (string) $request->input('sort_by', 'created_at');
        $sortDir = (string) $request->input('sort_dir', 'desc');
        $allowed = ['created_at', 'planned_pickup_at', 'planned_return_at', 'status'];

        if (in_array($sortBy, $allowed, true)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        $perPage = min((int) $request->input('per_page', 20), 100);

        return new RentalCollection($query->paginate($perPage));
    }

    public function store(StartRentalRequest $request): JsonResponse
    {
        $reservation = Reservation::with(['customer', 'vehicle', 'pickupLocation', 'returnLocation'])
            ->findOrFail($request->validated('reservation_id'));

        try {
            $rental = $this->service->createFromReservation($reservation);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }

        $rental->load(['customer', 'vehicle', 'reservation', 'pickupLocation', 'returnLocation']);

        return (new RentalResource($rental))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Rental $rental): RentalResource
    {
        $rental->load(['customer', 'vehicle', 'reservation', 'pickupLocation', 'returnLocation']);

        return new RentalResource($rental);
    }

    public function checkout(CheckoutRentalRequest $request, Rental $rental): RentalResource|JsonResponse
    {
        try {
            $rental = $this->service->checkout($rental, $request->validated());
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }

        return new RentalResource($rental);
    }

    public function checkin(CheckinRentalRequest $request, Rental $rental): RentalResource|JsonResponse
    {
        try {
            $rental = $this->service->checkin($rental, $request->validated());
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }

        return new RentalResource($rental);
    }

    public function cancel(Rental $rental): RentalResource|JsonResponse
    {
        try {
            $rental = $this->service->cancel($rental);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }

        return new RentalResource(
            $rental->load(['customer', 'vehicle', 'reservation', 'pickupLocation', 'returnLocation'])
        );
    }
}
