<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\CustomFormRequest;
use App\Http\Rules\BooleanValidationRule;
use Illuminate\Validation\Rule;

class CouponRequest extends CustomFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $coupon = $this->route('coupon');
        $required = $this->method() === 'POST' ? 'required' : 'nullable';

        return [
            'code' => [$required, 'string', 'max:50', Rule::unique('coupons', 'code')->ignore(is_object($coupon) ? $coupon->id : null)],
            'type' => [$required, 'string', 'in:PERCENTAGE,FIXED'],
            'value' => [$required, 'numeric', 'min:0'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'publish' => ['nullable', new BooleanValidationRule],
        ];
    }
}
