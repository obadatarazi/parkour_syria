<?php

namespace App\Http\Requests\Api;

use App\Http\Requests\CustomFormRequest;

/**
 * The public "suggest" form. No account needed, so the route is rate limited.
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
            'type' => ['required', 'string', 'in:place,coach,team,event'],
            'name' => ['required', 'string', 'max:255'],
            'area_id' => ['nullable', 'integer', 'exists:areas,id'],
            'description' => ['nullable', 'string', 'max:5000'],
            'contact' => ['nullable', 'string', 'max:255'],
            'starts_at' => ['nullable', 'required_if:type,event', 'date', 'after:now'],
            'proposer_name' => ['nullable', 'string', 'max:255'],
            'proposer_contact' => ['nullable', 'string', 'max:255'],
            'payload' => ['nullable', 'array'],
            // The visitor confirms the place is safe and is not a damaged building.
            'safety_accepted' => ['accepted'],
        ];
    }
}
