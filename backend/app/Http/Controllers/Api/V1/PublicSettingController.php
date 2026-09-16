<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;

class PublicSettingController extends Controller
{
    /**
     * Kthen vetëm settings me is_public = true.
     * Përdoret nga klienti publik (frontend) për të shfaqur company info, min/max booking days.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Setting::publicSettings(),
        ]);
    }
}
