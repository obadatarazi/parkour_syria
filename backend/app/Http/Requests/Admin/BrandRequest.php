<?php

namespace App\Http\Requests\Admin;

use App\Constant\Upload;
use App\Http\Requests\TranslationFormRequest;
use App\Http\Rules\BooleanValidationRule;
use App\Rules\SafeSvg;

class BrandRequest extends TranslationFormRequest
{
    public function rules(): array
    {
        $rules = [];
        if ($this->method() === 'POST') {
            $rules = [
                'logo' => ['nullable', 'file', 'mimes:jpeg,jpg,png,gif,webp,svg', 'max:'.Upload::MAX_IMAGE_KB, new SafeSvg],
                'publish' => ['nullable', new BooleanValidationRule],
                'translations' => ['required', 'array'],
                'translations.*.title' => ['required', 'string', 'max:255'],
                'translations.*.description' => ['nullable', 'string'],
            ];
        }

        if ($this->method() === 'PUT' || $this->method() === 'PATCH') {
            $rules = [
                'logo' => ['nullable', 'file', 'mimes:jpeg,jpg,png,gif,webp,svg', 'max:'.Upload::MAX_IMAGE_KB, new SafeSvg],
                'publish' => ['nullable', new BooleanValidationRule],
                'translations' => ['nullable', 'array'],
                'translations.*.title' => ['nullable', 'string', 'max:255'],
                'translations.*.description' => ['nullable', 'string'],
            ];
        }

        return parent::customRules($rules);
    }
}
