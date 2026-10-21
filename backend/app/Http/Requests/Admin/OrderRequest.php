<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\CustomFormRequest;

/**
 * An order is never created or deleted from the dashboard, only moved along its status.
 */
class OrderRequest extends CustomFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:PENDING,CONFIRMED,SHIPPED,COMPLETED,CANCELLED'],
            'note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
