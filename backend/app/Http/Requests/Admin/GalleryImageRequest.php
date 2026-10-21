<?php

namespace App\Http\Requests\Admin;

use App\Constant\Upload;
use App\Http\Requests\TranslationFormRequest;
use App\Http\Rules\BooleanValidationRule;
use App\Rules\SafeSvg;

class GalleryImageRequest extends TranslationFormRequest
{
    public function rules(): array
    {
        $rules = [];

        if ($this->method() === 'POST') {
            $rules = [
                'image' => ['nullable', 'file', 'mimes:jpeg,jpg,png,gif,webp,svg', 'max:' . Upload::MAX_IMAGE_KB, new SafeSvg()],
                'sort_order' => ['nullable', 'integer', 'min:0'],
                'publish' => ['nullable', new BooleanValidationRule()],
                'translations' => ['required', 'array'],
                // Arabic is the live language and is required, English is optional until it goes public.
                'translations.ar' => ['required', 'array'],
                'translations.en' => ['nullable', 'array'],
                'translations.ar.caption' => ['required', 'string', 'max:255'],
                'translations.en.caption' => ['required_with:translations.en', 'nullable', 'string', 'max:255'],
            ];
        }

        if ($this->method() === 'PUT' || $this->method() === 'PATCH') {
            $rules = [
                'image' => ['nullable', 'file', 'mimes:jpeg,jpg,png,gif,webp,svg', 'max:' . Upload::MAX_IMAGE_KB, new SafeSvg()],
                'sort_order' => ['nullable', 'integer', 'min:0'],
                'publish' => ['nullable', new BooleanValidationRule()],
                'translations' => ['nullable', 'array'],
                'translations.ar' => ['nullable', 'array'],
                'translations.en' => ['nullable', 'array'],
                'translations.ar.caption' => ['required_with:translations.ar', 'string', 'max:255'],
                'translations.en.caption' => ['required_with:translations.en', 'nullable', 'string', 'max:255'],
            ];
        }

        return parent::customRules($rules);
    }
}
