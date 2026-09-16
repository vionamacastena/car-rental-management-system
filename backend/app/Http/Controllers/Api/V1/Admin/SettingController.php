<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\SettingResource;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SettingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Setting::query()->orderBy('group')->orderBy('label');

        if ($request->filled('group')) {
            $query->where('group', $request->input('group'));
        }

        $settings = $query->get();

        // Grupimi sipas `group`
        $grouped = $settings->groupBy('group')->map(function ($items) {
            return SettingResource::collection($items)->resolve();
        });

        return response()->json(['data' => $grouped]);
    }

    /**
     * Përditësim bulk — pranon { settings: { key: value, ... } }.
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings' => ['required', 'array'],
            'settings.*' => ['nullable'],
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['settings'] as $key => $value) {
                Setting::set($key, $value);
            }
        });

        Setting::clearCache();

        return response()->json(['message' => 'Konfigurimet u ruajtën.']);
    }

    public function show(Setting $setting): SettingResource
    {
        return new SettingResource($setting);
    }
}
