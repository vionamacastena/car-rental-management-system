<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Availability\AvailabilityEngine;
use App\Domain\Availability\BookingConflictException;
use App\Domain\Pricing\PricingCalculator;
use App\Enums\ReservationSource;
use App\Enums\ReservationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\PublicBookingRequest;
use App\Http\Resources\ReservationResource;
use App\Models\Customer;
use App\Models\Reservation;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicReservationController extends Controller
{
    public function __construct(
        private readonly AvailabilityEngine $availability,
        private readonly PricingCalculator $pricing,
    ) {}

    /**
     * Krijon rezervim nga klient (pa auth).
     * Rate-limited: 10/min/IP në route.
     */
    public function store(PublicBookingRequest $request): JsonResponse
    {
        $data = $request->validated();

        $vehicle = Vehicle::findOrFail($data['vehicle_id']);
        $pickup = Carbon::parse($data['pickup_at']);
        $return = Carbon::parse($data['return_at']);

        // 1. Krijo ose gjej customer
        $customer = Customer::findOrCreateFromBooking([
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => strtolower(trim($data['email'])),
            'phone' => $data['phone'],
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'country' => $data['country'] ?? null,
            'date_of_birth' => $data['date_of_birth'] ?? null,
            'driver_license_number' => $data['driver_license_number'] ?? null,
            'driver_license_expiry' => $data['driver_license_expiry'] ?? null,
        ]);

        // 2. Kalkulo pricing
        $pricing = $this->pricing->calculate($vehicle, $pickup, $return);

        // 3. Krijo rezervimin me mbrojtje nga double-booking
        try {
            $reservation = $this->availability->createReservationSafely([
                'customer_id' => $customer->id,
                'vehicle_id' => $vehicle->id,
                'pickup_location_id' => $data['pickup_location_id'],
                'return_location_id' => $data['return_location_id'],
                'pickup_at' => $pickup,
                'return_at' => $return,
                'status' => ReservationStatus::RESERVED,
                'source' => ReservationSource::PUBLIC,
                'notes' => $data['notes'] ?? null,
                ...$pricing,
            ]);
        } catch (BookingConflictException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'code' => 'vehicle_unavailable',
            ], 409);
        }

        $reservation->load(['customer', 'vehicle', 'pickupLocation', 'returnLocation']);

        return (new ReservationResource($reservation))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Kërkim i rezervimit nga klienti me kod + email.
     * Për të shmangur enumeration, kërkojmë të dyjat.
     */
    public function lookup(Request $request): ReservationResource|JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:255'],
        ]);

        $reservation = Reservation::query()
            ->with(['customer', 'vehicle', 'pickupLocation', 'returnLocation'])
            ->where('reservation_code', $validated['code'])
            ->whereHas('customer', fn ($q) =>
                $q->whereRaw('LOWER(email) = ?', [strtolower($validated['email'])])
            )
            ->first();

        if (! $reservation) {
            return response()->json([
                'message' => 'Rezervimi nuk u gjet. Kontrollo kodin dhe email-in.',
            ], 404);
        }

        return new ReservationResource($reservation);
    }
}
