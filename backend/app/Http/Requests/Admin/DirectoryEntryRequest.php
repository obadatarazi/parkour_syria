<?php

namespace App\Http\Requests\Admin;

use App\Constant\Upload;
use App\Http\Requests\TranslationFormRequest;
use App\Http\Rules\BooleanValidationRule;
use App\Rules\SafeSvg;
use Illuminate\Validation\Rule;

class DirectoryEntryRequest extends TranslationFormRequest
{
    public function rules(): array
    {
        $rules = [];

        if ($this->method() === 'POST') {
            $rules = [
                'image' => ['nullable', 'file', 'mimes:jpeg,jpg,png,gif,webp,svg', 'max:' . Upload::MAX_IMAGE_KB, new SafeSvg()],
                'slug' => ['nullable', 'string', 'max:140', 'regex:/^[\\p{L}\\p{N}-]+$/u', Rule::unique('directory_entries', 'slug')->ignore($this->routeKey())],
                'type' => ['required', 'string', 'in:place,coach,team'],
                'area_id' => ['nullable', 'integer', 'exists:areas,id'],
                'whatsapp' => ['nullable', 'string', 'max:30'],
                'facebook_url' => ['nullable', 'url', 'max:2000'],
                'instagram_url' => ['nullable', 'url', 'max:2000'],
                'map_url' => ['nullable', 'url', 'max:2000'],
                'verified' => ['nullable', new BooleanValidationRule()],
                'publish' => ['nullable', new BooleanValidationRule()],
                'sort_order' => ['nullable', 'integer', 'min:0'],
                'translations' => ['required', 'array'],
                // Arabic is the live language and is required, English is optional until it goes public.
                'translations.ar' => ['required', 'array'],
                'translations.en' => ['nullable', 'array'],
                'translations.ar.name' => ['required', 'string', 'max:255'],
                'translations.en.name' => ['required_with:translations.en', 'nullable', 'string', 'max:255'],
                'translations.*.description' => ['nullable', 'string'],
            ];
        }

        if ($this->method() === 'PUT' || $this->method() === 'PATCH') {
            $rules = [
                'image' => ['nullable', 'file', 'mimes:jpeg,jpg,png,gif,webp,svg', 'max:' . Upload::MAX_IMAGE_KB, new SafeSvg()],
                'slug' => ['nullable', 'string', 'max:140', 'regex:/^[\\p{L}\\p{N}-]+$/u', Rule::unique('directory_entries', 'slug')->ignore($this->routeKey())],
                'type' => ['nullable', 'string', 'in:place,coach,team'],
                'area_id' => ['nullable', 'integer', 'exists:areas,id'],
                'whatsapp' => ['nullable', 'string', 'max:30'],
                'facebook_url' => ['nullable', 'url', 'max:2000'],
                'instagram_url' => ['nullable', 'url', 'max:2000'],
                'map_url' => ['nullable', 'url', 'max:2000'],
                'verified' => ['nullable', new BooleanValidationRule()],
                'publish' => ['nullable', new BooleanValidationRule()],
                'sort_order' => ['nullable', 'integer', 'min:0'],
                'translations' => ['nullable', 'array'],
                'translations.ar' => ['nullable', 'array'],
                'translations.en' => ['nullable', 'array'],
                'translations.ar.name' => ['required_with:translations.ar', 'string', 'max:255'],
                'translations.en.name' => ['required_with:translations.en', 'nullable', 'string', 'max:255'],
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
        $object = $this->route('directory_entry');

        return is_object($object) ? (int) $object->getKey() : (is_numeric($object) ? (int) $object : null);
    }
}
