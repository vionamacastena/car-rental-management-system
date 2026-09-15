<?php

use App\Http\Controllers\Api\V1\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Api\V1\Admin\LocationController as AdminLocationController;
use App\Http\Controllers\Api\V1\Admin\RentalController as AdminRentalController;
use App\Http\Controllers\Api\V1\Admin\ReservationController as AdminReservationController;
use App\Http\Controllers\Api\V1\Admin\VehicleController as AdminVehicleController;
use App\Http\Controllers\Api\V1\Admin\VehiclePhotoController as AdminVehiclePhotoController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\AvailabilityController;
use App\Http\Controllers\Api\V1\LocationController;
use App\Http\Controllers\Api\V1\PublicReservationController;
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

    // Public booking
    Route::post('/reservations', [PublicReservationController::class, 'store'])->middleware('throttle:10,1');
    Route::post('/reservations/lookup', [PublicReservationController::class, 'lookup'])->middleware('throttle:20,1');

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
        Route::post('vehicles/{vehicle}/photos', [AdminVehiclePhotoController::class, 'store']);
        Route::patch('vehicles/{vehicle}/photos/{photo}/primary', [AdminVehiclePhotoController::class, 'setPrimary']);
        Route::patch('vehicles/{vehicle}/photos/reorder', [AdminVehiclePhotoController::class, 'reorder']);
        Route::delete('vehicles/{vehicle}/photos/{photo}', [AdminVehiclePhotoController::class, 'destroy']);

        Route::apiResource('reservations', AdminReservationController::class)->except(['destroy']);
        Route::post('reservations/{reservation}/cancel', [AdminReservationController::class, 'cancel']);
        Route::patch('reservations/{reservation}/status', [AdminReservationController::class, 'updateStatus']);
        Route::delete('reservations/{reservation}', [AdminReservationController::class, 'destroy']);

        // Rentals
        Route::get('rentals', [AdminRentalController::class, 'index']);
        Route::post('rentals', [AdminRentalController::class, 'store']);
        Route::get('rentals/{rental}', [AdminRentalController::class, 'show']);
        Route::post('rentals/{rental}/checkout', [AdminRentalController::class, 'checkout']);
        Route::post('rentals/{rental}/cancel', [AdminRentalController::class, 'cancel']);
    });
});
