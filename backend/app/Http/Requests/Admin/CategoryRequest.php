<?php

namespace App\Http\Requests\Admin;

use App\Constant\Upload;
use App\Http\Requests\TranslationFormRequest;
use App\Http\Rules\BooleanValidationRule;
use App\Rules\SafeSvg;

class CategoryRequest extends TranslationFormRequest
{
    public function rules(): array
    {
        $category = $this->route('category');
        $required = $this->method() === 'POST' ? 'required' : 'nullable';

        $rules = [
            'image' => ['nullable', 'file', 'mimes:jpeg,jpg,png,gif,webp,svg', 'max:'.Upload::MAX_IMAGE_KB, new SafeSvg],
            'publish' => ['nullable', new BooleanValidationRule],
            'parent_category_id' => [
                'nullable',
                'integer',
                'exists:categories,id',
                // A category can't be its own parent.
                is_object($category) ? 'not_in:'.$category->id : 'nullable',
            ],
            'translations' => [$required, 'array'],
            'translations.*.title' => [$required, 'string', 'max:255'],
            'translations.*.description' => ['nullable', 'string'],
        ];

        return parent::customRules($rules);
    }
}
