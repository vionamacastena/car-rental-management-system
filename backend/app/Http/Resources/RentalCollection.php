<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class RentalCollection extends ResourceCollection
{
    public $collects = RentalResource::class;
}
