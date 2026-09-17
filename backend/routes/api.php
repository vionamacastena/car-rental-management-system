<?php

use App\Http\Controllers\Api\V1\Admin\AuditLogController as AdminAuditLogController;
use App\Http\Controllers\Api\V1\Admin\ContractController as AdminContractController;
use App\Http\Controllers\Api\V1\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Api\V1\Admin\DocumentController as AdminDocumentController;
use App\Http\Controllers\Api\V1\Admin\InvoiceController as AdminInvoiceController;
use App\Http\Controllers\Api\V1\Admin\LocationController as AdminLocationController;
use App\Http\Controllers\Api\V1\Admin\MaintenanceController as AdminMaintenanceController;
use App\Http\Controllers\Api\V1\Admin\NotificationController as AdminNotificationController;
use App\Http\Controllers\Api\V1\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Api\V1\Admin\RentalController as AdminRentalController;
use App\Http\Controllers\Api\V1\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Api\V1\Admin\ReservationController as AdminReservationController;
use App\Http\Controllers\Api\V1\Admin\VehicleController as AdminVehicleController;
use App\Http\Controllers\Api\V1\Admin\VehiclePhotoController as AdminVehiclePhotoController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\AvailabilityController;
use App\Http\Controllers\Api\V1\LocationController;
use App\Http\Controllers\Api\V1\PublicReservationController;
use App\Http\Controllers\Api\V1\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\Api\V1\PublicSettingController;
use App\Http\Controllers\Api\V1\VehicleController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/health', fn () => response()->json([
        'status' => 'ok',
        'service' => 'crms-api',
        'time' => now()->toIso8601String(),
    ]));

    // Public — read-only (rate limited)
    Route::middleware('throttle:public-api')->group(function () {
        Route::get('/locations', [LocationController::class, 'index']);
        Route::get('/locations/{location}', [LocationController::class, 'show']);
        Route::get('/vehicles', [VehicleController::class, 'index']);
        Route::get('/vehicles/{vehicle}', [VehicleController::class, 'show']);
        Route::get('/availability', [AvailabilityController::class, 'index']);
        Route::get('/settings/public', [PublicSettingController::class, 'index']);
    });

    // Public — booking
    Route::middleware('throttle:booking')->group(function () {
        Route::post('/reservations', [PublicReservationController::class, 'store']);
    });
    Route::middleware('throttle:lookup')->group(function () {
        Route::post('/reservations/lookup', [PublicReservationController::class, 'lookup']);
    });

    // Auth
    Route::middleware('throttle:login')->group(function () {
        Route::post('/auth/login', [AuthController::class, 'login']);
    });
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
    });

    // Admin — kërkon auth + rate limit
    Route::middleware(['auth:sanctum', 'throttle:admin-api'])->prefix('admin')->group(function () {
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

        Route::get('rentals', [AdminRentalController::class, 'index']);
        Route::post('rentals', [AdminRentalController::class, 'store']);
        Route::get('rentals/{rental}', [AdminRentalController::class, 'show']);
        Route::post('rentals/{rental}/checkout', [AdminRentalController::class, 'checkout']);
        Route::post('rentals/{rental}/checkin', [AdminRentalController::class, 'checkin']);
        Route::post('rentals/{rental}/cancel', [AdminRentalController::class, 'cancel']);

        Route::get('payments', [AdminPaymentController::class, 'index']);
        Route::post('payments', [AdminPaymentController::class, 'store']);
        Route::get('payments/summary', [AdminPaymentController::class, 'summary']);
        Route::get('payments/{payment}', [AdminPaymentController::class, 'show']);
        Route::post('payments/{payment}/refund', [AdminPaymentController::class, 'refund']);

        Route::get('invoices', [AdminInvoiceController::class, 'index']);
        Route::post('invoices', [AdminInvoiceController::class, 'store']);
        Route::get('invoices/{invoice}', [AdminInvoiceController::class, 'show']);
        Route::get('invoices/{invoice}/pdf', [AdminInvoiceController::class, 'pdf']);
        Route::post('invoices/{invoice}/regenerate', [AdminInvoiceController::class, 'regenerate']);
        Route::post('invoices/{invoice}/mark-paid', [AdminInvoiceController::class, 'markPaid']);

        Route::get('contracts', [AdminContractController::class, 'index']);
        Route::post('contracts', [AdminContractController::class, 'store']);
        Route::get('contracts/{contract}', [AdminContractController::class, 'show']);
        Route::get('contracts/{contract}/pdf', [AdminContractController::class, 'pdf']);
        Route::post('contracts/{contract}/regenerate', [AdminContractController::class, 'regenerate']);
        Route::post('contracts/{contract}/sign-customer', [AdminContractController::class, 'signCustomer']);
        Route::post('contracts/{contract}/sign-admin', [AdminContractController::class, 'signAdmin']);

        Route::get('maintenance', [AdminMaintenanceController::class, 'index']);
        Route::post('maintenance', [AdminMaintenanceController::class, 'store']);
        Route::get('maintenance/{maintenance}', [AdminMaintenanceController::class, 'show']);
        Route::put('maintenance/{maintenance}', [AdminMaintenanceController::class, 'update']);
        Route::post('maintenance/{maintenance}/cancel', [AdminMaintenanceController::class, 'cancel']);
        Route::delete('maintenance/{maintenance}', [AdminMaintenanceController::class, 'destroy']);

        Route::get('documents', [AdminDocumentController::class, 'index']);
        Route::post('documents', [AdminDocumentController::class, 'store']);
        Route::get('documents/{document}', [AdminDocumentController::class, 'show']);
        Route::get('documents/{document}/download', [AdminDocumentController::class, 'download']);
        Route::delete('documents/{document}', [AdminDocumentController::class, 'destroy']);

        Route::get('notifications', [AdminNotificationController::class, 'index']);
        Route::get('notifications/unread-count', [AdminNotificationController::class, 'unreadCount']);
        Route::post('notifications/{id}/read', [AdminNotificationController::class, 'markAsRead']);
        Route::post('notifications/mark-all-read', [AdminNotificationController::class, 'markAllAsRead']);
        Route::delete('notifications/{id}', [AdminNotificationController::class, 'destroy']);

        Route::get('reports/dashboard', [AdminReportController::class, 'dashboard']);
        Route::get('reports/revenue', [AdminReportController::class, 'revenue']);
        Route::get('reports/vehicles', [AdminReportController::class, 'vehicles']);
        Route::get('reports/locations', [AdminReportController::class, 'locations']);

        Route::get('audit-logs', [AdminAuditLogController::class, 'index']);
        Route::get('audit-logs/actions', [AdminAuditLogController::class, 'actions']);
        Route::get('audit-logs/{auditLog}', [AdminAuditLogController::class, 'show']);

        Route::get('settings', [AdminSettingController::class, 'index']);
Route::post('settings/bulk-update', [AdminSettingController::class, 'bulkUpdate']);
Route::get('settings/{setting}', [AdminSettingController::class, 'show']);

Route::get('/health', function () {
    $checks = [
        'app' => 'ok',
        'database' => 'ok',
        'cache' => 'ok',
        'storage' => 'ok',
    ];

    try {
        DB::connection()->getPdo();
    } catch (\Throwable $e) {
        $checks['database'] = 'fail';
    }

    try {
        Cache::put('health-check', 'ok', 5);
        $checks['cache'] = Cache::get('health-check') === 'ok' ? 'ok' : 'fail';
    } catch (\Throwable $e) {
        $checks['cache'] = 'fail';
    }

    try {
        Storage::disk('local')->put('health-check.txt', 'ok');
        $checks['storage'] = Storage::disk('local')->exists('health-check.txt') ? 'ok' : 'fail';
        Storage::disk('local')->delete('health-check.txt');
    } catch (\Throwable $e) {
        $checks['storage'] = 'fail';
    }

    $allOk = ! in_array('fail', $checks, true);

    return response()->json([
        'status' => $allOk ? 'ok' : 'degraded',
        'service' => 'crms-api',
        'version' => config('app.version', '1.0.0'),
        'checks' => $checks,
        'time' => now()->toIso8601String(),
    ], $allOk ? 200 : 503);
});


Route::get('/debug-db', function () {
    return response()->json([
        'default_connection' => config('database.default'),
        'driver' => config('database.connections.' . config('database.default') . '.driver'),
        'host' => config('database.connections.' . config('database.default') . '.host'),
        'port' => config('database.connections.' . config('database.default') . '.port'),
        'database' => config('database.connections.' . config('database.default') . '.database'),
    ]);
});
    });
});
