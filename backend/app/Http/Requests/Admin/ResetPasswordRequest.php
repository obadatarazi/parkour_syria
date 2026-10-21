<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\CustomFormRequest;
use Illuminate\Validation\Rules\Password;

class ResetPasswordRequest extends CustomFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:255'],
            'token' => ['required', 'string', 'max:255'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ];
    }
}
