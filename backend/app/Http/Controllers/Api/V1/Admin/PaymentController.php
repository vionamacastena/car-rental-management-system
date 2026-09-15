<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Payments\PaymentService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\RefundPaymentRequest;
use App\Http\Requests\Api\V1\Admin\StorePaymentRequest;
use App\Http\Resources\PaymentCollection;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Models\Rental;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class PaymentController extends Controller
{
    public function __construct(
        private readonly PaymentService $service,
    ) {}

    public function index(Request $request): PaymentCollection
    {
        $query = Payment::query()
            ->with(['customer', 'receivedBy']);

        if ($request->filled('search')) {
            $search = strtolower(trim((string) $request->input('search')));
            $like = "%{$search}%";
            $query->where(function ($q) use ($like) {
                $q->whereRaw('LOWER(payment_code) LIKE ?', [$like])
                  ->orWhereRaw('LOWER(reference) LIKE ?', [$like])
                  ->orWhereHas('customer', function ($cq) use ($like) {
                      $cq->whereRaw('LOWER(first_name) LIKE ?', [$like])
                         ->orWhereRaw('LOWER(last_name) LIKE ?', [$like])
                         ->orWhereRaw('LOWER(email) LIKE ?', [$like]);
                  });
            });
        }

        if ($request->filled('type')) {
            $types = (array) $request->input('type');
            $query->whereIn('type', $types);
        }

        if ($request->filled('method')) {
            $query->where('method', $request->input('method'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('customer_id')) {
            $query->where('customer_id', (int) $request->input('customer_id'));
        }

        if ($request->filled('payable_type') && $request->filled('payable_id')) {
            $query->where('payable_type', $request->input('payable_type'))
                  ->where('payable_id', (int) $request->input('payable_id'));
        }

        $query->orderByDesc('paid_at');

        $perPage = min((int) $request->input('per_page', 20), 100);

        return new PaymentCollection($query->paginate($perPage));
    }

    public function store(StorePaymentRequest $request): JsonResponse
    {
        $data = $request->validated();

        $payable = $data['payable_type'] === 'rental'
            ? Rental::findOrFail($data['payable_id'])
            : Reservation::findOrFail($data['payable_id']);

        $payment = $this->service->register($payable, $data, auth()->id());

        return (new PaymentResource($payment->load(['customer', 'receivedBy'])))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Payment $payment): PaymentResource
    {
        $payment->load(['customer', 'receivedBy', 'payable']);

        return new PaymentResource($payment);
    }

    public function refund(RefundPaymentRequest $request, Payment $payment): PaymentResource|JsonResponse
{
    try {
        $refund = $this->service->refund(
            $payment,
            (float) $request->validated('amount'),
            $request->validated(),
            auth()->id(),
        );
    } catch (RuntimeException $e) {
        return response()->json(['message' => $e->getMessage()], 409);
    }

    // Forco 200 OK — refund është action, jo create nga këndvështrimi i klientit
    return (new PaymentResource($refund->load(['customer', 'receivedBy'])))
        ->response()
        ->setStatusCode(200);
}

    /**
     * Summary financiar për një rental/reservation specifik.
     */
    public function summary(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'payable_type' => ['required', 'in:rental,reservation'],
            'payable_id' => ['required', 'integer'],
        ]);

        $payable = $validated['payable_type'] === 'rental'
            ? Rental::findOrFail($validated['payable_id'])
            : Reservation::findOrFail($validated['payable_id']);

        return response()->json([
            'data' => $this->service->summary($payable),
        ]);
    }
}
