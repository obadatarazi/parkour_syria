<?php

namespace App\Http\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class BooleanValidationRule implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if ($this->isValidBoolean($value)) {
            return;
        }

        $fail($this->message());
    }

    protected function isValidBoolean(mixed $value): bool
    {
        if (in_array($value, [true, false, 1, 0, '1', '0'], true)) {
            return true;
        }

        if (is_string($value)) {
            return in_array(strtolower($value), ['true', 'false', 'on', 'off', 'yes', 'no'], true);
        }

        return false;
    }

    public function message(): string
    {
        return ':attribute must be true or false.';
    }
}
