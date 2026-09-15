<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\StoreCustomerRequest;
use App\Http\Requests\Api\V1\Admin\UpdateCustomerRequest;
use App\Http\Resources\CustomerCollection;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request): CustomerCollection
    {
        $query = Customer::query();

        if ($request->filled('search')) {
            $search = strtolower(trim((string) $request->input('search')));
            $like = "%{$search}%";
            $query->where(function ($q) use ($like) {
                $q->whereRaw('LOWER(first_name) LIKE ?', [$like])
                  ->orWhereRaw('LOWER(last_name) LIKE ?', [$like])
                  ->orWhereRaw('LOWER(email) LIKE ?', [$like])
                  ->orWhereRaw('LOWER(phone) LIKE ?', [$like]);
            });
        }

        $sortBy = (string) $request->input('sort_by', 'created_at');
        $sortDir = (string) $request->input('sort_dir', 'desc');
        $allowed = ['created_at', 'first_name', 'last_name', 'email'];

        if (in_array($sortBy, $allowed, true)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        $perPage = min((int) $request->input('per_page', 20), 100);

        return new CustomerCollection($query->paginate($perPage));
    }

    public function store(StoreCustomerRequest $request): JsonResponse
    {
        $customer = Customer::create($request->validated());

        return (new CustomerResource($customer))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Customer $customer): CustomerResource
    {
        return new CustomerResource($customer);
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): CustomerResource
    {
        $customer->update($request->validated());

        return new CustomerResource($customer->fresh());
    }

    public function destroy(Customer $customer): JsonResponse
    {
        // TODO (Faza 3.5): blloko nëse ka reservations active
        $customer->delete();

        return response()->json(['message' => 'Klienti u fshi.']);
    }
}
