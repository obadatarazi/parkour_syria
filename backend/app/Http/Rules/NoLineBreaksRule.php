<?php

namespace App\Http\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Refuses a value carrying a carriage return or line feed.
 *
 * Laravel 11's `email` rule lets CRLF through (fixed only in later majors), and an address that
 * reaches a mail header with one in it can inject headers of its own. Every email field that may
 * be mailed carries this until the framework upgrade lands.
 */
class NoLineBreaksRule implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (is_string($value) && preg_match('/[\r\n]/', $value)) {
            $fail('validation.email')->translate();
        }
    }
}
