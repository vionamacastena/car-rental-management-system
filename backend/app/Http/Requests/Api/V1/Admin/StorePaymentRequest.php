<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payable_type' => ['required', 'string', 'in:rental,reservation'],
            'payable_id' => ['required', 'integer', 'min:1'],
            'type' => ['required', new Enum(PaymentType::class)],
            'method' => ['required', new Enum(PaymentMethod::class)],
            'status' => ['sometimes', new Enum(PaymentStatus::class)],
            'amount' => ['required', 'numeric', 'min:0.01', 'max:1000000'],
            'reference' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'paid_at' => ['nullable', 'date'],
        ];
    }
}
