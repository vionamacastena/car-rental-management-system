<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Reports\ReportService;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(
        private readonly ReportService $service,
    ) {}

    /**
     * KPI-t kryesore për dashboard.
     */
    public function dashboard(Request $request): JsonResponse
    {
        [$from, $to] = $this->resolveRange($request);

        return response()->json([
            'data' => $this->service->dashboard($from, $to),
            'range' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ],
        ]);
    }

    /**
     * Revenue chart me group_by.
     */
    public function revenue(Request $request): JsonResponse
    {
        [$from, $to] = $this->resolveRange($request);
        $groupBy = $request->input('group_by', 'day');

        if (! in_array($groupBy, ['day', 'week', 'month'], true)) {
            $groupBy = 'day';
        }

        return response()->json([
            'data' => $this->service->revenueChart($from, $to, $groupBy),
            'group_by' => $groupBy,
        ]);
    }

    public function vehicles(Request $request): JsonResponse
    {
        [$from, $to] = $this->resolveRange($request);

        return response()->json([
            'data' => $this->service->vehiclePerformance($from, $to),
        ]);
    }

    public function locations(Request $request): JsonResponse
    {
        [$from, $to] = $this->resolveRange($request);

        return response()->json([
            'data' => $this->service->locationPerformance($from, $to),
        ]);
    }

    /**
     * Kthe [from, to] bazuar në query params.
     * Default: 30 ditët e fundit.
     */
    private function resolveRange(Request $request): array
    {
        $from = $request->filled('from')
            ? Carbon::parse($request->input('from'))->startOfDay()
            : now()->subDays(29)->startOfDay();

        $to = $request->filled('to')
            ? Carbon::parse($request->input('to'))->endOfDay()
            : now()->endOfDay();

        return [$from, $to];
    }
}
