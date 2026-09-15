<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SignContractRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'signature' => ['required', 'string', 'max:500000'], // base64 data URL
            'party' => ['required', 'in:customer,admin'],
        ];
    }
}
