<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class VehicleCollection extends ResourceCollection
{
    public $collects = VehicleResource::class;
}
