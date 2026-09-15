<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Maintenance\MaintenanceService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\StoreMaintenanceRequest;
use App\Http\Requests\Api\V1\Admin\UpdateMaintenanceRequest;
use App\Http\Resources\MaintenanceCollection;
use App\Http\Resources\MaintenanceResource;
use App\Models\MaintenanceRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class MaintenanceController extends Controller
{
    public function __construct(
        private readonly MaintenanceService $service,
    ) {}

    public function index(Request $request): MaintenanceCollection
    {
        $query = MaintenanceRecord::query()
            ->with(['vehicle', 'createdBy']);

        if ($request->filled('search')) {
            $search = strtolower(trim((string) $request->input('search')));
            $like = "%{$search}%";
            $query->where(function ($q) use ($like) {
                $q->whereRaw('LOWER(maintenance_code) LIKE ?', [$like])
                  ->orWhereRaw('LOWER(title) LIKE ?', [$like])
                  ->orWhereHas('vehicle', function ($vq) use ($like) {
                      $vq->whereRaw('LOWER(brand) LIKE ?', [$like])
                         ->orWhereRaw('LOWER(model) LIKE ?', [$like])
                         ->orWhereRaw('LOWER(license_plate) LIKE ?', [$like]);
                  });
            });
        }

        if ($request->filled('status')) {
            $statuses = (array) $request->input('status');
            $query->whereIn('status', $statuses);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->filled('vehicle_id')) {
            $query->where('vehicle_id', (int) $request->input('vehicle_id'));
        }

        if ($request->boolean('overdue')) {
            $query->where('status', 'scheduled')
                  ->where('scheduled_at', '<', now());
        }

        if ($request->boolean('upcoming_service')) {
            $query->whereNotNull('next_service_at')
                  ->whereBetween('next_service_at', [now(), now()->addDays(30)]);
        }

        $sortBy = (string) $request->input('sort_by', 'created_at');
        $sortDir = (string) $request->input('sort_dir', 'desc');
        $allowed = ['created_at', 'scheduled_at', 'next_service_at', 'cost'];

        if (in_array($sortBy, $allowed, true)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        $perPage = min((int) $request->input('per_page', 20), 100);

        return new MaintenanceCollection($query->paginate($perPage));
    }

    public function store(StoreMaintenanceRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated(), auth()->id());

        return (new MaintenanceResource($record->load(['vehicle', 'createdBy'])))
            ->response()
            ->setStatusCode(201);
    }

    public function show(MaintenanceRecord $maintenance): MaintenanceResource
    {
        $maintenance->load(['vehicle', 'createdBy']);

        return new MaintenanceResource($maintenance);
    }

    public function update(UpdateMaintenanceRequest $request, MaintenanceRecord $maintenance): MaintenanceResource|JsonResponse
    {
        try {
            $record = $this->service->update($maintenance, $request->validated());
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }

        return new MaintenanceResource($record->load(['vehicle', 'createdBy']));
    }

    public function cancel(MaintenanceRecord $maintenance): MaintenanceResource|JsonResponse
    {
        try {
            $record = $this->service->cancel($maintenance);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }

        return new MaintenanceResource($record->load(['vehicle', 'createdBy']));
    }

    public function destroy(MaintenanceRecord $maintenance): JsonResponse
    {
        try {
            $this->service->delete($maintenance);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }

        return response()->json(['message' => 'Maintenance u fshi.']);
    }
}
