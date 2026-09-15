<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\VehicleStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\StoreVehicleRequest;
use App\Http\Requests\Api\V1\Admin\UpdateVehicleRequest;
use App\Http\Resources\VehicleCollection;
use App\Http\Resources\VehicleResource;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index(Request $request): VehicleCollection
    {
        $query = Vehicle::query()
            ->with(['currentLocation', 'photos', 'primaryPhoto']);

        if ($request->filled('search')) {
            $search = strtolower(trim((string) $request->input('search')));
            $like = "%{$search}%";

            // LOWER(...) LIKE ? punon si në PostgreSQL ashtu edhe në SQLite
            $query->where(function ($q) use ($like) {
                $q->whereRaw('LOWER(brand) LIKE ?', [$like])
                  ->orWhereRaw('LOWER(model) LIKE ?', [$like])
                  ->orWhereRaw('LOWER(license_plate) LIKE ?', [$like]);
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('fuel_type')) {
            $query->where('fuel_type', $request->input('fuel_type'));
        }

        if ($request->filled('transmission')) {
            $query->where('transmission', $request->input('transmission'));
        }

        if ($request->filled('location_id')) {
            $query->where('current_location_id', (int) $request->input('location_id'));
        }

        $sortBy = (string) $request->input('sort_by', 'created_at');
        $sortDir = (string) $request->input('sort_dir', 'desc');
        $allowed = ['brand', 'year', 'daily_price', 'mileage', 'created_at', 'status'];

        if (in_array($sortBy, $allowed, true)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        $perPage = min((int) $request->input('per_page', 20), 100);

        return new VehicleCollection($query->paginate($perPage));
    }

    public function store(StoreVehicleRequest $request): JsonResponse
    {
        $vehicle = Vehicle::create($request->validated());

        return (new VehicleResource($vehicle->load(['currentLocation'])))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Vehicle $vehicle): VehicleResource
    {
        $vehicle->load(['currentLocation', 'photos', 'primaryPhoto']);

        return new VehicleResource($vehicle);
    }

    public function update(UpdateVehicleRequest $request, Vehicle $vehicle): VehicleResource
    {
        $vehicle->update($request->validated());

        return new VehicleResource($vehicle->fresh()->load(['currentLocation', 'photos', 'primaryPhoto']));
    }

    public function destroy(Vehicle $vehicle): JsonResponse
    {
        if (in_array($vehicle->status->value, ['rented', 'reserved'], true)) {
            return response()->json([
                'message' => "Nuk mund të fshihet — automjeti është me status '{$vehicle->status->label()}'.",
            ], 409);
        }

        $vehicle->delete();

        return response()->json(['message' => 'Automjeti u fshi.']);
    }

    public function updateStatus(Request $request, Vehicle $vehicle): VehicleResource
    {
        $validated = $request->validate([
            'status' => ['required', new \Illuminate\Validation\Rules\Enum(VehicleStatus::class)],
        ]);

        $vehicle->update(['status' => $validated['status']]);

        return new VehicleResource($vehicle->fresh()->load(['currentLocation', 'photos', 'primaryPhoto']));
    }
}
