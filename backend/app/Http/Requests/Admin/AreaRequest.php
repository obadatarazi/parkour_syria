<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\TranslationFormRequest;
use App\Http\Rules\BooleanValidationRule;
use Illuminate\Validation\Rule;

class AreaRequest extends TranslationFormRequest
{
    public function rules(): array
    {
        $rules = [];

        if ($this->method() === 'POST') {
            $rules = [
                'slug' => ['nullable', 'string', 'max:140', 'regex:/^[\\p{L}\\p{N}-]+$/u', Rule::unique('areas', 'slug')->ignore($this->routeKey())],
                'sort_order' => ['nullable', 'integer', 'min:0'],
                'publish' => ['nullable', new BooleanValidationRule()],
                'translations' => ['required', 'array'],
                // Arabic is the live language and is required, English is optional until it goes public.
                'translations.ar' => ['required', 'array'],
                'translations.en' => ['nullable', 'array'],
                'translations.ar.name' => ['required', 'string', 'max:255'],
                'translations.en.name' => ['required_with:translations.en', 'nullable', 'string', 'max:255'],
            ];
        }

        if ($this->method() === 'PUT' || $this->method() === 'PATCH') {
            $rules = [
                'slug' => ['nullable', 'string', 'max:140', 'regex:/^[\\p{L}\\p{N}-]+$/u', Rule::unique('areas', 'slug')->ignore($this->routeKey())],
                'sort_order' => ['nullable', 'integer', 'min:0'],
                'publish' => ['nullable', new BooleanValidationRule()],
                'translations' => ['nullable', 'array'],
                'translations.ar' => ['nullable', 'array'],
                'translations.en' => ['nullable', 'array'],
                'translations.ar.name' => ['required_with:translations.ar', 'string', 'max:255'],
                'translations.en.name' => ['required_with:translations.en', 'nullable', 'string', 'max:255'],
            ];
        }

        return parent::customRules($rules);
    }

    /**
     * The record being updated, so a PUT does not report its own slug as taken.
     */
    private function routeKey(): ?int
    {
        $object = $this->route('area');

        return is_object($object) ? (int) $object->getKey() : (is_numeric($object) ? (int) $object : null);
    }
}
