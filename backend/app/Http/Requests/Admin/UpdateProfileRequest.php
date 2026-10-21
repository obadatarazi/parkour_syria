<?php

namespace App\Http\Requests\Admin;

use App\Constant\Upload;
use App\Http\Requests\CustomFormRequest;
use App\Http\Rules\NoLineBreaksRule;
use App\Rules\SafeSvg;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends CustomFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        $rules = [];
        if ($this->method() === 'PUT' || $this->method() === 'PATCH') {
            $rules = [
                'full_name' => ['nullable', 'max:255'],
                'gender' => ['nullable', 'string', 'in:MALE,FEMALE'],
                'phone_number' => ['nullable', 'string', 'max:30', Rule::unique('users', 'phone_number')->ignore($this->user()?->id)],
                'avatar' => ['nullable', 'file', 'mimes:jpg,jpeg,png,gif,webp,svg', 'max:' . Upload::MAX_IMAGE_KB, new SafeSvg()],
                'email' => ['nullable', 'email', new NoLineBreaksRule(), Rule::unique('users', 'email')->ignore($this->user()?->id)],
            ];
        }

        return $rules;
    }
}
