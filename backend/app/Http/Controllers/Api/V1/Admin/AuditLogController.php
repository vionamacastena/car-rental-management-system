<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLogCollection;
use App\Http\Resources\AuditLogResource;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request): AuditLogCollection
    {
        $query = AuditLog::query()->with('user');

        if ($request->filled('search')) {
            $search = strtolower(trim((string) $request->input('search')));
            $like = "%{$search}%";
            $query->where(function ($q) use ($like) {
                $q->whereRaw('LOWER(user_name) LIKE ?', [$like])
                  ->orWhereRaw('LOWER(entity_label) LIKE ?', [$like])
                  ->orWhereRaw('LOWER(description) LIKE ?', [$like]);
            });
        }

        if ($request->filled('action')) {
            $query->where('action', $request->input('action'));
        }

        if ($request->filled('entity_type')) {
            $query->where('entity_type', 'like', '%' . $request->input('entity_type') . '%');
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', (int) $request->input('user_id'));
        }

        if ($request->filled('from')) {
            $query->where('created_at', '>=', $request->input('from'));
        }

        if ($request->filled('to')) {
            $query->where('created_at', '<=', $request->input('to'));
        }

        $query->orderByDesc('created_at');
        $perPage = min((int) $request->input('per_page', 30), 100);

        return new AuditLogCollection($query->paginate($perPage));
    }

    public function show(AuditLog $auditLog): AuditLogResource
    {
        $auditLog->load('user');

        return new AuditLogResource($auditLog);
    }

    /**
     * Lista e actions unike (për filtrim).
     */
    public function actions(): \Illuminate\Http\JsonResponse
    {
        $actions = AuditLog::query()
            ->distinct()
            ->orderBy('action')
            ->pluck('action')
            ->all();

        return response()->json(['data' => $actions]);
    }
}
