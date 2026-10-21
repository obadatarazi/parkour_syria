<?php

namespace App\Http\Requests\Admin;

use App\Rules\SafeSvg;
use App\Http\Requests\TranslationFormRequest;
use App\Http\Rules\BooleanValidationRule;

class BrandRequest extends TranslationFormRequest
{
    public function rules(): array
    {
        $rules = [];
        if ($this->method() === 'POST') {
            $rules = [
                'logo' => ['nullable', 'file', 'mimes:jpeg,jpg,png,gif,webp,svg', 'max:2048000', new SafeSvg()],
                'publish' => ['nullable', new BooleanValidationRule()],
                'translations' => ['required', 'array'],
                'translations.*.title' => ['required', 'string', 'max:255'],
                'translations.*.description' => ['nullable', 'string'],
            ];
        }

        if ($this->method() === 'PUT' || $this->method() === 'PATCH') {
            $rules = [
                'logo' => ['nullable', 'file', 'mimes:jpeg,jpg,png,gif,webp,svg', 'max:2048000', new SafeSvg()],
                'publish' => ['nullable', new BooleanValidationRule()],
                'translations' => ['nullable', 'array'],
                'translations.*.title' => ['nullable', 'string', 'max:255'],
                'translations.*.description' => ['nullable', 'string'],
            ];
        }

        return parent::customRules($rules);
    }
}
