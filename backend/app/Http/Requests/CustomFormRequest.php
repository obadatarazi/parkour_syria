<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class CustomFormRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->has('publish')) {
            $this->merge([
                'publish' => filter_var($this->publish, FILTER_VALIDATE_BOOLEAN),
            ]);
        }

        if ($this->has('read')) {
            $this->merge([
                'read' => filter_var($this->read, FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }

    public function all($keys = null)
    {
        $data = parent::all($keys);

        return $this->convertKeysToSnakeCase($data);
    }

    /**
     * Laravel compares raw JSON keys to snake_case rule keys. Re-run the check
     * against snake_cased input so camelCase API clients are not rejected.
     */
    protected function validateNoUnknownFields(Validator $validator): void
    {
        $allowedKeys = array_keys($this->validationRules());

        $input = $this->isJson() ? $this->json()->all() : $this->request->all();
        $input = Arr::except($this->convertKeysToSnakeCase($input), ['_token', '_method']);

        foreach ($this->dotInputKeys($input) as $inputKey) {
            if (! $this->isKnownField($inputKey, $allowedKeys)) {
                $inputKey = str_replace('\.', '.', $inputKey);

                $validator->errors()->add($inputKey, trans('validation.prohibited', [
                    'attribute' => str_replace('_', ' ', $inputKey),
                ]));
            }
        }
    }

    private function convertKeysToSnakeCase($data)
    {
        $snakeCaseData = [];

        foreach ($data as $key => $value) {
            $snakeCaseKey = Str::snake($key);

            if (is_array($value)) {
                $snakeCaseData[$snakeCaseKey] = $this->convertKeysToSnakeCase($value);
            } else {
                $snakeCaseData[$snakeCaseKey] = $value;
            }
        }

        return $snakeCaseData;
    }
}
