<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\CustomFormRequest;

class RefreshTokenRequest extends CustomFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // The client sends `refreshToken`; CustomFormRequest validates keys in snake_case.
        return [
            'refresh_token' => ['required', 'string', 'max:100'],
        ];
    }
}
