<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\VehicleStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\VehicleCollection;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class AvailabilityController extends Controller
{
    public function index(Request $request): VehicleCollection
    {
        // Validim bazë
        $validated = $request->validate([
            'pickup_location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'return_location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'pickup_at' => ['nullable', 'date'],
            'return_at' => ['nullable', 'date', 'after:pickup_at'],
        ]);

        $query = Vehicle::query()
            ->with(['currentLocation', 'photos', 'primaryPhoto'])
            ->where('status', VehicleStatus::AVAILABLE->value);

        if (! empty($validated['pickup_location_id'])) {
            $query->where('current_location_id', $validated['pickup_location_id']);
        }

        // TODO (Faza 4): overlap logic me reservations
        // Për momentin kthen vetëm vehicles me status AVAILABLE.

        $vehicles = $query->orderBy('daily_price')->get();

        return new VehicleCollection($vehicles);
    }
}
