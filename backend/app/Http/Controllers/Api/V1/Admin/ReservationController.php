<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Availability\AvailabilityEngine;
use App\Domain\Availability\BookingConflictException;
use App\Enums\ReservationSource;
use App\Enums\ReservationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\StoreReservationRequest;
use App\Http\Requests\Api\V1\Admin\UpdateReservationRequest;
use App\Http\Resources\ReservationCollection;
use App\Http\Resources\ReservationResource;
use App\Models\Reservation;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;

class ReservationController extends Controller
{
    public function __construct(
        private readonly AvailabilityEngine $availability,
    ) {}

    public function index(Request $request): ReservationCollection
    {
        $query = Reservation::query()
            ->with(['customer', 'vehicle', 'pickupLocation', 'returnLocation']);

        if ($request->filled('search')) {
            $search = strtolower(trim((string) $request->input('search')));
            $like = "%{$search}%";
            $query->where(function ($q) use ($like) {
                $q->whereRaw('LOWER(reservation_code) LIKE ?', [$like])
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

        if ($request->filled('customer_id')) {
            $query->where('customer_id', (int) $request->input('customer_id'));
        }

        if ($request->filled('from')) {
            $query->where('pickup_at', '>=', $request->input('from'));
        }

        if ($request->filled('to')) {
            $query->where('return_at', '<=', $request->input('to'));
        }

        if ($request->boolean('upcoming')) {
            $query->where('pickup_at', '>=', now())
                  ->whereIn('status', [
                      ReservationStatus::RESERVED->value,
                      ReservationStatus::PICKED_UP->value,
                  ]);
        }

        $sortBy = (string) $request->input('sort_by', 'pickup_at');
        $sortDir = (string) $request->input('sort_dir', 'desc');
        $allowed = ['pickup_at', 'return_at', 'created_at', 'total', 'status'];

        if (in_array($sortBy, $allowed, true)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        $perPage = min((int) $request->input('per_page', 20), 100);

        return new ReservationCollection($query->paginate($perPage));
    }

    public function store(StoreReservationRequest $request): JsonResponse
    {
        $data = $request->validated();

        $vehicle = Vehicle::findOrFail($data['vehicle_id']);
        $pickup = Carbon::parse($data['pickup_at']);
        $return = Carbon::parse($data['return_at']);

        $days = max(1, (int) ceil($pickup->diffInHours($return) / 24));
        $dailyPrice = (float) $vehicle->daily_price;
        $subtotal = round($days * $dailyPrice, 2);

        $payload = [
            'customer_id' => $data['customer_id'],
            'vehicle_id' => $data['vehicle_id'],
            'pickup_location_id' => $data['pickup_location_id'],
            'return_location_id' => $data['return_location_id'],
            'pickup_at' => $pickup,
            'return_at' => $return,
            'days' => $days,
            'daily_price_snapshot' => $dailyPrice,
            'subtotal' => $subtotal,
            'extras_total' => 0,
            'fees_total' => 0,
            'taxes_total' => 0,
            'discount_total' => 0,
            'total' => $subtotal,
            'deposit_amount' => 0,
            'status' => ReservationStatus::RESERVED,
            'source' => $data['source'] ?? ReservationSource::ADMIN->value,
            'notes' => $data['notes'] ?? null,
            'internal_notes' => $data['internal_notes'] ?? null,
        ];

        try {
            $reservation = $this->availability->createReservationSafely($payload);
        } catch (BookingConflictException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }

        $reservation->load(['customer', 'vehicle', 'pickupLocation', 'returnLocation']);

        return (new ReservationResource($reservation))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Reservation $reservation): ReservationResource
    {
        $reservation->load(['customer', 'vehicle', 'pickupLocation', 'returnLocation']);

        return new ReservationResource($reservation);
    }

    public function update(UpdateReservationRequest $request, Reservation $reservation): ReservationResource
    {
        if (in_array($reservation->status, [ReservationStatus::COMPLETED, ReservationStatus::CANCELLED], true)) {
            abort(409, 'Rezervimi nuk mund të editohet në statusin aktual.');
        }

        $reservation->update($request->validated());

        return new ReservationResource(
            $reservation->fresh()->load(['customer', 'vehicle', 'pickupLocation', 'returnLocation'])
        );
    }

    /**
     * Anulon një rezervim. Nuk fshin fizikisht — ruan audit trail.
     */
    public function cancel(Request $request, Reservation $reservation): ReservationResource
    {
        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        if (in_array($reservation->status, [
            ReservationStatus::COMPLETED,
            ReservationStatus::CANCELLED,
        ], true)) {
            abort(409, "Rezervimi është tashmë në statusin '{$reservation->status->label()}'.");
        }

        $reservation->update([
            'status' => ReservationStatus::CANCELLED,
            'cancelled_at' => now(),
            'cancelled_reason' => $validated['reason'] ?? null,
        ]);

        return new ReservationResource(
            $reservation->fresh()->load(['customer', 'vehicle', 'pickupLocation', 'returnLocation'])
        );
    }

    /**
     * Ndryshon statusin e rezervimit.
     */
    public function updateStatus(Request $request, Reservation $reservation): ReservationResource
    {
        $validated = $request->validate([
            'status' => ['required', new Enum(ReservationStatus::class)],
        ]);

        $newStatus = ReservationStatus::from($validated['status']);

        // Nuk lejojmë kalim nga cancelled/completed përsëri në blocking
        if (in_array($reservation->status, [ReservationStatus::CANCELLED, ReservationStatus::COMPLETED], true)
            && $newStatus->isBlocking()) {
            abort(409, 'Nuk mund të rikthehet një rezervim i mbyllur.');
        }

        $data = ['status' => $newStatus];

        if ($newStatus === ReservationStatus::CANCELLED && ! $reservation->cancelled_at) {
            $data['cancelled_at'] = now();
        }

        $reservation->update($data);

        return new ReservationResource(
            $reservation->fresh()->load(['customer', 'vehicle', 'pickupLocation', 'returnLocation'])
        );
    }

    /**
     * Fshin fizikisht vetëm rezervimet e anuluara.
     */
    public function destroy(Reservation $reservation): JsonResponse
    {
        if ($reservation->status !== ReservationStatus::CANCELLED) {
            abort(409, 'Vetëm rezervimet e anuluara mund të fshihen fizikisht.');
        }

        $reservation->delete();

        return response()->json(['message' => 'Rezervimi u fshi.']);
    }
}
