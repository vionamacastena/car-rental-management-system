<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class MaintenanceCollection extends ResourceCollection
{
    public $collects = MaintenanceResource::class;
}
