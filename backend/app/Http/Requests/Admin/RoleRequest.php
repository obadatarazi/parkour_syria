<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\CustomFormRequest;

class RoleRequest extends CustomFormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
        switch ($this->method()) {
            case 'DELETE':
            case 'GET':
                return [];
            case 'PATCH':
            case 'PUT':
            $role = $this->route('role');
            return [
                    'name' => 'max:100|unique:roles,name,' . $role->id,
                    'standard' => 'boolean',
                    'permissions.*' => 'exists:permissions,id'
                ];
            case 'POST':
                return [
                    'name' => 'required|max:100|unique:roles',
                    'standard' => 'boolean',
                    'permissions.*' => 'required|exists:permissions,id'
                ];
            default:
                break;
        }
        return [];
    }
}
