<?php

namespace App\Http\Requests\Admin;

use App\Constant\Upload;
use App\Http\Requests\CustomFormRequest;
use App\Http\Rules\BooleanValidationRule;
use App\Http\Rules\NoLineBreaksRule;
use App\Rules\SafeSvg;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserRequest extends CustomFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        switch ($this->method()) {
            case 'GET':
            case 'DELETE':
                return [];
            case 'POST':
                return [
                    'full_name' => 'nullable|max:100',
                    'email' => ['required', 'email', new NoLineBreaksRule(), 'unique:users,email'],
                    'phone_number' => ['nullable', 'string', 'max:30', 'unique:users,phone_number'],
                    'password' => ['required', 'confirmed', Password::defaults()],
                    'avatar' => ['nullable', 'file', 'mimes:jpg,jpeg,png,gif,webp,svg', 'max:' . Upload::MAX_IMAGE_KB, new SafeSvg()],
                    'gender' => 'nullable|string|in:MALE,FEMALE',
                    'type' => 'required|string|in:ADMIN',
                    'active' => ['nullable', new BooleanValidationRule()],
                    'roles' => ['sometimes', 'array'],
                    'roles.*' => 'required|exists:roles,id',
                ];
            case 'PUT':
            case 'PATCH':
                return [
                    'full_name' => 'nullable|max:100',
                    'email' => ['nullable', 'email', new NoLineBreaksRule(), Rule::unique('users', 'email')->ignore($this->userId())],
                    'phone_number' => ['nullable', 'string', 'max:30', Rule::unique('users', 'phone_number')->ignore($this->userId())],
                    'password' => ['nullable', 'confirmed', Password::defaults()],
                    'avatar' => ['nullable', 'file', 'mimes:jpg,jpeg,png,gif,webp,svg', 'max:' . Upload::MAX_IMAGE_KB, new SafeSvg()],
                    'gender' => 'nullable|string|in:MALE,FEMALE',
                    'type' => 'nullable|string|in:ADMIN',
                    'active' => ['nullable', new BooleanValidationRule()],
                    'roles' => ['sometimes', 'array'],
                    'roles.*' => 'nullable|exists:roles,id',
                ];
            default:
                break;
        }
        return [];
    }

    /**
     * The user being updated, so a PUT does not report the account's own email or phone as taken.
     */
    private function userId(): ?int
    {
        $user = $this->route('user');

        return is_object($user) ? (int) $user->id : (is_numeric($user) ? (int) $user : null);
    }
}
