<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Enums\DocumentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'documentable_type' => ['required', 'string', 'in:customer,vehicle,rental,reservation,contract,invoice'],
            'documentable_id' => ['required', 'integer', 'min:1'],
            'type' => ['required', new Enum(DocumentType::class)],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'file' => [
                'required',
                'file',
                'max:20480', // 20MB
                'mimes:pdf,jpg,jpeg,png,webp,doc,docx,xls,xlsx',
            ],
            'expires_at' => ['nullable', 'date'],
            'is_confidential' => ['nullable', 'boolean'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
