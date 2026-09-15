<?php

use App\Http\Controllers\Api\V1\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Api\V1\Admin\LocationController as AdminLocationController;
use App\Http\Controllers\Api\V1\Admin\VehicleController as AdminVehicleController;
use App\Http\Controllers\Api\V1\Admin\VehiclePhotoController as AdminVehiclePhotoController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\AvailabilityController;
use App\Http\Controllers\Api\V1\LocationController;
use App\Http\Controllers\Api\V1\VehicleController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/health', fn () => response()->json([
        'status' => 'ok',
        'service' => 'crms-api',
        'time' => now()->toIso8601String(),
    ]));

    // Public
    Route::get('/locations', [LocationController::class, 'index']);
    Route::get('/locations/{location}', [LocationController::class, 'show']);
    Route::get('/vehicles', [VehicleController::class, 'index']);
    Route::get('/vehicles/{vehicle}', [VehicleController::class, 'show']);
    Route::get('/availability', [AvailabilityController::class, 'index']);

    // Auth
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:5,15');
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
    });

    // Admin
    Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
        Route::apiResource('locations', AdminLocationController::class);
        Route::apiResource('vehicles', AdminVehicleController::class);
        Route::apiResource('customers', AdminCustomerController::class);

        Route::patch('vehicles/{vehicle}/status', [AdminVehicleController::class, 'updateStatus']);

        // Vehicle photos
        Route::post('vehicles/{vehicle}/photos', [AdminVehiclePhotoController::class, 'store']);
        Route::patch('vehicles/{vehicle}/photos/{photo}/primary', [AdminVehiclePhotoController::class, 'setPrimary']);
        Route::patch('vehicles/{vehicle}/photos/reorder', [AdminVehiclePhotoController::class, 'reorder']);
        Route::delete('vehicles/{vehicle}/photos/{photo}', [AdminVehiclePhotoController::class, 'destroy']);
    });
});
