<?php

namespace App\Http\Requests\Admin;

use App\Constant\Upload;
use App\Http\Requests\TranslationFormRequest;
use App\Http\Rules\BooleanValidationRule;
use App\Rules\SafeSvg;
use Illuminate\Validation\Rule;

class ProductRequest extends TranslationFormRequest
{
    public function rules(): array
    {
        $rules = [];

        if ($this->method() === 'POST') {
            $rules = [
                'image' => ['nullable', 'file', 'mimes:jpeg,jpg,png,gif,webp,svg', 'max:' . Upload::MAX_IMAGE_KB, new SafeSvg()],
                'slug' => ['nullable', 'string', 'max:140', 'regex:/^[\\p{L}\\p{N}-]+$/u', Rule::unique('products', 'slug')->ignore($this->routeKey())],
                'sku_code' => ['nullable', 'string', 'max:100', Rule::unique('products', 'sku_code')->ignore($this->routeKey())],
                'brand_id' => ['nullable', 'integer', 'exists:brands,id'],
                'category_id' => ['nullable', 'integer', 'exists:categories,id'],
                'price' => ['nullable', 'numeric', 'min:0'],
                'stock' => ['nullable', 'integer', 'min:0'],
                'publish' => ['nullable', new BooleanValidationRule()],
                'translations' => ['required', 'array'],
                // Arabic is the live language and is required, English is optional until it goes public.
                'translations.ar' => ['required', 'array'],
                'translations.en' => ['nullable', 'array'],
                'translations.ar.title' => ['required', 'string', 'max:255'],
                'translations.en.title' => ['required_with:translations.en', 'nullable', 'string', 'max:255'],
                'translations.*.description' => ['nullable', 'string'],
            ];
        }

        if ($this->method() === 'PUT' || $this->method() === 'PATCH') {
            $rules = [
                'image' => ['nullable', 'file', 'mimes:jpeg,jpg,png,gif,webp,svg', 'max:' . Upload::MAX_IMAGE_KB, new SafeSvg()],
                'slug' => ['nullable', 'string', 'max:140', 'regex:/^[\\p{L}\\p{N}-]+$/u', Rule::unique('products', 'slug')->ignore($this->routeKey())],
                'sku_code' => ['nullable', 'string', 'max:100', Rule::unique('products', 'sku_code')->ignore($this->routeKey())],
                'brand_id' => ['nullable', 'integer', 'exists:brands,id'],
                'category_id' => ['nullable', 'integer', 'exists:categories,id'],
                'price' => ['nullable', 'numeric', 'min:0'],
                'stock' => ['nullable', 'integer', 'min:0'],
                'publish' => ['nullable', new BooleanValidationRule()],
                'translations' => ['nullable', 'array'],
                'translations.ar' => ['nullable', 'array'],
                'translations.en' => ['nullable', 'array'],
                'translations.ar.title' => ['required_with:translations.ar', 'string', 'max:255'],
                'translations.en.title' => ['required_with:translations.en', 'nullable', 'string', 'max:255'],
                'translations.*.description' => ['nullable', 'string'],
            ];
        }

        return parent::customRules($rules);
    }

    /**
     * The record being updated, so a PUT does not report its own slug as taken.
     */
    private function routeKey(): ?int
    {
        $object = $this->route('product');

        return is_object($object) ? (int) $object->getKey() : (is_numeric($object) ? (int) $object : null);
    }
}
