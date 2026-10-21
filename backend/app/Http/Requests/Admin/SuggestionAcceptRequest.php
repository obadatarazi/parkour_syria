<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\CustomFormRequest;
use App\Http\Rules\BooleanValidationRule;

/**
 * Accepting a suggestion. Everything is optional: what is not sent is taken from the suggestion.
 */
class SuggestionAcceptRequest extends CustomFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        if ($this->has('verified')) {
            $this->merge(['verified' => filter_var($this->verified, FILTER_VALIDATE_BOOLEAN)]);
        }
    }

    public function rules(): array
    {
        return [
            'publish' => ['nullable', new BooleanValidationRule()],
            'verified' => ['nullable', new BooleanValidationRule()],
            'slug' => ['nullable', 'string', 'max:140', 'regex:/^[\p{L}\p{N}-]+$/u'],
            // Only read for an event: overrides the date the visitor proposed.
            'event_type' => ['nullable', 'string', 'in:workshop,gathering'],
            'starts_at' => ['nullable', 'date'],
        ];
    }
}
