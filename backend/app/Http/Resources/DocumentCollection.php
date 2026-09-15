<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class DocumentCollection extends ResourceCollection
{
    public $collects = DocumentResource::class;
}
