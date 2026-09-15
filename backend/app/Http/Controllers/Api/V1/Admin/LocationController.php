<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\StoreLocationRequest;
use App\Http\Requests\Api\V1\Admin\UpdateLocationRequest;
use App\Http\Resources\LocationResource;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class LocationController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $locations = Location::query()
            ->withCount('vehicles')
            ->orderBy('name')
            ->get();

        return LocationResource::collection($locations);
    }

    public function store(StoreLocationRequest $request): JsonResponse
    {
        $location = Location::create($request->validated());

        return (new LocationResource($location))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Location $location): LocationResource
    {
        $location->loadCount('vehicles');

        return new LocationResource($location);
    }

    public function update(UpdateLocationRequest $request, Location $location): LocationResource
    {
        $location->update($request->validated());

        return new LocationResource($location->fresh());
    }

    public function destroy(Location $location): JsonResponse
    {
        // Blloko fshirjen nëse ka vehicles të caktuara
        $vehiclesCount = $location->vehicles()->count();
        if ($vehiclesCount > 0) {
            return response()->json([
                'message' => "Nuk mund të fshihet — ka {$vehiclesCount} automjete të caktuara në këtë lokacion.",
            ], 409);
        }

        $location->delete();

        return response()->json(['message' => 'Lokacioni u fshi.']);
    }
}
