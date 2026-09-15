<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\VehiclePhotoResource;
use App\Models\Vehicle;
use App\Models\VehiclePhoto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VehiclePhotoController extends Controller
{
    /**
     * Upload foto të reja për një vehicle.
     * Pranon multiple files në një request.
     */
    public function store(Request $request, Vehicle $vehicle): JsonResponse
    {
        $validated = $request->validate([
            'photos' => ['required', 'array', 'max:10'],
            'photos.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'], // max 5MB
        ]);

        $existingCount = $vehicle->photos()->count();
        $hasPrimary = $vehicle->photos()->where('is_primary', true)->exists();

        $created = [];

        foreach ($validated['photos'] as $index => $file) {
            $path = $file->store("vehicles/{$vehicle->id}", 'public');

            $photo = $vehicle->photos()->create([
                'path' => $path,
                'is_primary' => ! $hasPrimary && $index === 0, // bëj të parën primary nëse s'ka
                'sort_order' => $existingCount + $index,
            ]);

            $created[] = $photo;
        }

        return response()->json([
            'data' => VehiclePhotoResource::collection($created),
        ], 201);
    }

    /**
     * Bëj një foto primary (heq primary nga të tjerat).
     */
    public function setPrimary(Vehicle $vehicle, VehiclePhoto $photo): VehiclePhotoResource
    {
        if ($photo->vehicle_id !== $vehicle->id) {
            abort(404);
        }

        // Hiq primary nga të gjitha
        $vehicle->photos()->update(['is_primary' => false]);

        // Vendos këtë si primary
        $photo->update(['is_primary' => true]);

        return new VehiclePhotoResource($photo->fresh());
    }

    /**
     * Fshij një foto.
     */
    public function destroy(Vehicle $vehicle, VehiclePhoto $photo): JsonResponse
    {
        if ($photo->vehicle_id !== $vehicle->id) {
            abort(404);
        }

        $wasPrimary = $photo->is_primary;

        // Fshij file-in fizik (vetëm nëse nuk është URL ekstern)
        if (! str_starts_with($photo->path, 'http')) {
            Storage::disk('public')->delete($photo->path);
        }

        $photo->delete();

        // Nëse ishte primary, bëj foton e parë të mbetur primary
        if ($wasPrimary) {
            $vehicle->photos()->orderBy('sort_order')->first()?->update(['is_primary' => true]);
        }

        return response()->json(['message' => 'Foto u fshi.']);
    }

    /**
     * Riorganizo renditjen e fotove.
     */
    public function reorder(Request $request, Vehicle $vehicle): JsonResponse
    {
        $validated = $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['integer', 'exists:vehicle_photos,id'],
        ]);

        foreach ($validated['order'] as $index => $photoId) {
            $vehicle->photos()->where('id', $photoId)->update(['sort_order' => $index]);
        }

        return response()->json(['message' => 'Renditja u ruajt.']);
    }
}
