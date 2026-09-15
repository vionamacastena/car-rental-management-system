<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->notifications();

        if ($request->boolean('unread_only')) {
            $query->whereNull('read_at');
        }

        if ($request->filled('type')) {
            $query->where('data->type', $request->input('type'));
        }

        $perPage = min((int) $request->input('per_page', 20), 50);
        $paginator = $query->paginate($perPage);

        return response()->json([
            'data' => NotificationResource::collection($paginator->items()),
            'meta' => [
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'unread_count' => $request->user()->unreadNotifications()->count(),
            ],
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        return response()->json([
            'data' => [
                'unread_count' => $request->user()->unreadNotifications()->count(),
            ],
        ]);
    }

    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()->notifications()->find($id);

        if (! $notification) {
            return response()->json(['message' => 'Njoftimi nuk u gjet.'], 404);
        }

        if ($notification->read_at === null) {
            $notification->markAsRead();
        }

        // Riload eksplicit nga DB
        $fresh = $request->user()
            ->notifications()
            ->where('id', $id)
            ->firstOrFail();

        return response()->json([
            'data' => [
                'id' => $fresh->id,
                'type' => $fresh->data['type'] ?? 'unknown',
                'title' => $fresh->data['title'] ?? '',
                'message' => $fresh->data['message'] ?? '',
                'url' => $fresh->data['url'] ?? null,
                'is_read' => $fresh->read_at !== null,
                'read_at' => $fresh->read_at?->toIso8601String(),
                'created_at' => $fresh->created_at->toIso8601String(),
            ],
        ]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['message' => 'Të gjitha njoftimet u shënuan si të lexuara.']);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()->notifications()->find($id);

        if (! $notification) {
            return response()->json(['message' => 'Njoftimi nuk u gjet.'], 404);
        }

        $notification->delete();

        return response()->json(['message' => 'Njoftimi u fshi.']);
    }
}
