<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\LocationResource;
use App\Models\Location;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class LocationController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $locations = Location::query()
            ->active()
            ->withCount('vehicles')
            ->orderBy('name')
            ->get();

        return LocationResource::collection($locations);
    }

    public function show(Location $location): LocationResource
    {
        $location->loadCount('vehicles');

        return new LocationResource($location);
    }
}
