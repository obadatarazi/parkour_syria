<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\TranslationFormRequest;
use App\Http\Rules\BooleanValidationRule;
use App\Models\Currency;
use Illuminate\Contracts\Validation\ValidationRule;

class CurrencyRequest extends TranslationFormRequest
{
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        if ($this->has('isDefault')) {
            $this->merge([
                'isDefault' => filter_var($this->isDefault, FILTER_VALIDATE_BOOLEAN),
            ]);
        }

        if ($this->has('is_default')) {
            $this->merge([
                'is_default' => filter_var($this->is_default, FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }

    /**
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        $rules = [];
        if ($this->method() === 'POST') {
            $rules = [
                'symbol' => ['required', 'string', 'max:255'],
                'code' => ['required', 'string', 'max:255', 'unique:currencies,code'],
                'publish' => ['nullable', new BooleanValidationRule()],
                'is_default' => ['nullable', new BooleanValidationRule()],
                'translations' => ['required', 'array'],
                'translations.*.title' => ['required', 'string', 'max:255'],
            ];
        }

        if ($this->method() === 'PUT' || $this->method() === 'PATCH') {
            $rules = [
                'symbol' => ['nullable', 'string', 'max:255'],
                'code' => ['nullable', 'string', 'max:255', 'unique:currencies,code,' . $this->route('currency')?->id],
                'publish' => ['nullable', new BooleanValidationRule()],
                'is_default' => ['nullable', new BooleanValidationRule()],
                'translations' => ['nullable', 'array'],
                'translations.*.title' => ['nullable', 'string', 'max:255'],
            ];
        }

        return parent::customRules($rules);
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $currency = $this->route('currency');

            if (!$currency instanceof Currency) {
                return;
            }

            $data = $validator->getData();

            // The system must always keep exactly one default currency, so the current
            // default can only lose the flag by promoting another currency instead.
            if ($currency->is_default && array_key_exists('is_default', $data) && $data['is_default'] === false) {
                $validator->errors()->add('isDefault', __('validation.can_not_unset_default_currency'));
            }
        });
    }

    public function messages(): array
    {
        return [
            'code.unique' => __('validation.currency_code_exists'),
        ];
    }
}
