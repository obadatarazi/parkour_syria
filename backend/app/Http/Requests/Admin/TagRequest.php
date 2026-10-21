<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\TranslationFormRequest;
use App\Http\Rules\BooleanValidationRule;

class TagRequest extends TranslationFormRequest
{
    public function rules(): array
    {
        $rules = [];
        if ($this->method() === 'POST') {
            $rules = [
                'publish' => ['nullable', new BooleanValidationRule()],
                'translations' => ['required', 'array'],
                'translations.*.title' => ['required', 'string', 'max:255'],
            ];
        }

        if ($this->method() === 'PUT' || $this->method() === 'PATCH') {
            $rules = [
                'publish' => ['nullable', new BooleanValidationRule()],
                'translations' => ['nullable', 'array'],
                'translations.*.title' => ['nullable', 'string', 'max:255'],
            ];
        }

        return parent::customRules($rules);
    }
}
