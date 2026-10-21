<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\CustomFormRequest;

class ChangePasswordRequest extends CustomFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'current_password' => ['required', 'min:6'],
            'new_password' => ['required','confirmed','min:6'],
        ];
    }
}
