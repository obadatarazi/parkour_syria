<?php

namespace App\Http\Requests\Admin;

use App\Constant\Upload;
use App\Http\Requests\TranslationFormRequest;
use App\Http\Rules\BooleanValidationRule;
use App\Rules\SafeSvg;
use Illuminate\Validation\Rule;

class BlogPostRequest extends TranslationFormRequest
{
    public function rules(): array
    {
        $rules = [];

        if ($this->method() === 'POST') {
            $rules = [
                'image' => ['nullable', 'file', 'mimes:jpeg,jpg,png,gif,webp,svg', 'max:'.Upload::MAX_IMAGE_KB, new SafeSvg],
                'slug' => ['nullable', 'string', 'max:140', 'regex:/^[\\p{L}\\p{N}-]+$/u', Rule::unique('blog_posts', 'slug')->ignore($this->routeKey())],
                'blog_category_id' => ['nullable', 'integer', 'exists:blog_categories,id'],
                'publish' => ['nullable', new BooleanValidationRule],
                'published_at' => ['nullable', 'date'],
                'translations' => ['required', 'array'],
                // Arabic is the live language and is required, English is optional until it goes public.
                'translations.ar' => ['required', 'array'],
                'translations.en' => ['nullable', 'array'],
                'translations.ar.title' => ['required', 'string', 'max:255'],
                'translations.en.title' => ['required_with:translations.en', 'nullable', 'string', 'max:255'],
                'translations.*.excerpt' => ['nullable', 'string'],
                'translations.*.body' => ['nullable', 'string'],
                'translations.*.author' => ['nullable', 'string', 'max:120'],
                'translations.*.seo_title' => ['nullable', 'string', 'max:255'],
                'translations.*.seo_description' => ['nullable', 'string', 'max:500'],
            ];
        }

        if ($this->method() === 'PUT' || $this->method() === 'PATCH') {
            $rules = [
                'image' => ['nullable', 'file', 'mimes:jpeg,jpg,png,gif,webp,svg', 'max:'.Upload::MAX_IMAGE_KB, new SafeSvg],
                'slug' => ['nullable', 'string', 'max:140', 'regex:/^[\\p{L}\\p{N}-]+$/u', Rule::unique('blog_posts', 'slug')->ignore($this->routeKey())],
                'blog_category_id' => ['nullable', 'integer', 'exists:blog_categories,id'],
                'publish' => ['nullable', new BooleanValidationRule],
                'published_at' => ['nullable', 'date'],
                'translations' => ['nullable', 'array'],
                'translations.ar' => ['nullable', 'array'],
                'translations.en' => ['nullable', 'array'],
                'translations.ar.title' => ['required_with:translations.ar', 'string', 'max:255'],
                'translations.en.title' => ['required_with:translations.en', 'nullable', 'string', 'max:255'],
                'translations.*.excerpt' => ['nullable', 'string'],
                'translations.*.body' => ['nullable', 'string'],
                'translations.*.author' => ['nullable', 'string', 'max:120'],
                'translations.*.seo_title' => ['nullable', 'string', 'max:255'],
                'translations.*.seo_description' => ['nullable', 'string', 'max:500'],
            ];
        }

        return parent::customRules($rules);
    }

    /**
     * The record being updated, so a PUT does not report its own slug as taken.
     */
    private function routeKey(): ?int
    {
        $object = $this->route('blog_post');

        return is_object($object) ? (int) $object->getKey() : (is_numeric($object) ? (int) $object : null);
    }
}
