<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\CustomFormRequest;

class MultiTypeSettingRequest extends CustomFormRequest
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
                    'setting_key' => 'required|string|max:100|unique:multi_type_settings,setting_key',
                    'value' => 'nullable|string',
                    'type' => 'required|string|in:EMAIL,LINK,NUMBER,PHONE_NUMBER,TEXT,PERCENTAGE,BOOLEAN',
                    'description' => 'nullable|string',
                ];
            case 'PATCH':
            case 'PUT':
                return [
                    'value' => 'nullable|string',
                    'type' => 'nullable|string|in:EMAIL,LINK,NUMBER,PHONE_NUMBER,TEXT,PERCENTAGE,BOOLEAN',
                    'description' => 'nullable|string',
                ];
            default:
                break;
        }

        return [];
    }
}
