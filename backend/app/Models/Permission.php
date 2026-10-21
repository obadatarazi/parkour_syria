<?php

namespace App\Models;

use App\Http\Docs\Schemas\PermissionSchema;
use App\Http\Traits\Filterable;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission as abstractPermission;


#[PermissionSchema]
class Permission extends abstractPermission
{
    use Filterable;

    protected $filterable = [
        'name' => 'like',
    ];

    protected $sorterable = ['id', 'name', 'guard_name', 'created_at'];

    public function toArray(): array
    {
        $attributes = parent::toArray();
        $camelCaseAttributes = [];

        foreach ($attributes as $key => $value) {
            $camelCaseAttributes[Str::camel($key)] = $value;
        }
        return $camelCaseAttributes;
    }
}
