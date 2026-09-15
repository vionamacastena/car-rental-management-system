<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\FuelType;
use App\Enums\Transmission;
use App\Enums\VehicleStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\VehicleCollection;
use App\Http\Resources\VehicleResource;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index(Request $request): VehicleCollection
    {
        $query = Vehicle::query()
            ->with(['currentLocation', 'photos', 'primaryPhoto'])
            ->where('status', VehicleStatus::AVAILABLE->value);

       if ($request->filled('brand')) {
    $brand = strtolower(trim((string) $request->input('brand')));
    $query->whereRaw('LOWER(brand) LIKE ?', ["%{$brand}%"]);
}
        if ($request->filled('fuel_type')) {
            $fuelTypes = collect((array) $request->input('fuel_type'))
                ->filter(fn ($v) => in_array($v, array_column(FuelType::cases(), 'value'), true));
            if ($fuelTypes->isNotEmpty()) {
                $query->whereIn('fuel_type', $fuelTypes->all());
            }
        }

        if ($request->filled('transmission')) {
            $transmissions = collect((array) $request->input('transmission'))
                ->filter(fn ($v) => in_array($v, array_column(Transmission::cases(), 'value'), true));
            if ($transmissions->isNotEmpty()) {
                $query->whereIn('transmission', $transmissions->all());
            }
        }

        if ($request->filled('seats')) {
            $query->where('seats', '>=', (int) $request->input('seats'));
        }

        if ($request->filled('price_min')) {
            $query->where('daily_price', '>=', (float) $request->input('price_min'));
        }

        if ($request->filled('price_max')) {
            $query->where('daily_price', '<=', (float) $request->input('price_max'));
        }

        if ($request->filled('location_id')) {
            $query->where('current_location_id', (int) $request->input('location_id'));
        }

        // Sortim — cast në string, jo Stringable
        $sortBy = (string) $request->input('sort_by', 'daily_price');
        $sortDir = (string) $request->input('sort_dir', 'asc');
        $allowedSorts = ['daily_price', 'year', 'brand', 'mileage'];

        if (in_array($sortBy, $allowedSorts, true)) {
            $query->orderBy($sortBy, $sortDir === 'desc' ? 'desc' : 'asc');
        }

        $perPage = min((int) $request->input('per_page', 12), 50);

        return new VehicleCollection($query->paginate($perPage));
    }

    public function show(Vehicle $vehicle): VehicleResource
    {
        $vehicle->load(['currentLocation', 'photos', 'primaryPhoto']);

        return new VehicleResource($vehicle);
    }
}
