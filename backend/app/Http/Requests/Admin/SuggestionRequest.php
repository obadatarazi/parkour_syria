<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\CustomFormRequest;

/**
 * The dashboard tidying a suggestion up before accepting it.
 */
class SuggestionRequest extends CustomFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['nullable', 'string', 'in:place,coach,team,event'],
            'name' => ['nullable', 'string', 'max:255'],
            'area_id' => ['nullable', 'integer', 'exists:areas,id'],
            'description' => ['nullable', 'string', 'max:5000'],
            'contact' => ['nullable', 'string', 'max:255'],
            'starts_at' => ['nullable', 'date'],
            'proposer_name' => ['nullable', 'string', 'max:255'],
            'proposer_contact' => ['nullable', 'string', 'max:255'],
            'payload' => ['nullable', 'array'],
        ];
    }
}
