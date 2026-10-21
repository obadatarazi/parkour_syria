<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\CustomFormRequest;

class SuggestionRejectRequest extends CustomFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reject_reason' => ['required', 'string', 'max:2000'],
        ];
    }
}
