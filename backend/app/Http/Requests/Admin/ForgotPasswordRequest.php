<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\CustomFormRequest;

class ForgotPasswordRequest extends CustomFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:255'],
        ];
    }
}
