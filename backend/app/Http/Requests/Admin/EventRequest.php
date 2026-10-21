<?php

namespace App\Http\Requests\Admin;

use App\Constant\Upload;
use App\Http\Requests\TranslationFormRequest;
use App\Http\Rules\BooleanValidationRule;
use App\Rules\SafeSvg;
use Illuminate\Validation\Rule;

class EventRequest extends TranslationFormRequest
{
    public function rules(): array
    {
        $rules = [];

        if ($this->method() === 'POST') {
            $rules = [
                'image' => ['nullable', 'file', 'mimes:jpeg,jpg,png,gif,webp,svg', 'max:' . Upload::MAX_IMAGE_KB, new SafeSvg()],
                'slug' => ['nullable', 'string', 'max:140', 'regex:/^[\\p{L}\\p{N}-]+$/u', Rule::unique('events', 'slug')->ignore($this->routeKey())],
                'type' => ['required', 'string', 'in:workshop,gathering'],
                'starts_at' => ['required', 'date'],
                'area_id' => ['nullable', 'integer', 'exists:areas,id'],
                'contact' => ['nullable', 'string', 'max:255'],
                'publish' => ['nullable', new BooleanValidationRule()],
                'translations' => ['required', 'array'],
                // Arabic is the live language and is required, English is optional until it goes public.
                'translations.ar' => ['required', 'array'],
                'translations.en' => ['nullable', 'array'],
                'translations.ar.title' => ['required', 'string', 'max:255'],
                'translations.en.title' => ['required_with:translations.en', 'nullable', 'string', 'max:255'],
                'translations.*.location_label' => ['nullable', 'string', 'max:255'],
                'translations.*.description' => ['nullable', 'string'],
            ];
        }

        if ($this->method() === 'PUT' || $this->method() === 'PATCH') {
            $rules = [
                'image' => ['nullable', 'file', 'mimes:jpeg,jpg,png,gif,webp,svg', 'max:' . Upload::MAX_IMAGE_KB, new SafeSvg()],
                'slug' => ['nullable', 'string', 'max:140', 'regex:/^[\\p{L}\\p{N}-]+$/u', Rule::unique('events', 'slug')->ignore($this->routeKey())],
                'type' => ['nullable', 'string', 'in:workshop,gathering'],
                'starts_at' => ['nullable', 'date'],
                'area_id' => ['nullable', 'integer', 'exists:areas,id'],
                'contact' => ['nullable', 'string', 'max:255'],
                'publish' => ['nullable', new BooleanValidationRule()],
                'translations' => ['nullable', 'array'],
                'translations.ar' => ['nullable', 'array'],
                'translations.en' => ['nullable', 'array'],
                'translations.ar.title' => ['required_with:translations.ar', 'string', 'max:255'],
                'translations.en.title' => ['required_with:translations.en', 'nullable', 'string', 'max:255'],
                'translations.*.location_label' => ['nullable', 'string', 'max:255'],
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
        $object = $this->route('event');

        return is_object($object) ? (int) $object->getKey() : (is_numeric($object) ? (int) $object : null);
    }
}
