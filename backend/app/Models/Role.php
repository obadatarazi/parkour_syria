<?php

namespace App\Models;

use App\Http\Docs\Schemas\RoleSchema;
use App\Http\Traits\Filterable;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role as abstractRole;

#[RoleSchema]
class Role extends abstractRole
{
    use Filterable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = ['name', 'standard'];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = ['guard_name'];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime:Y-m-d H:i:s',
    ];

    protected $filterable = [
        'name' => 'like',
        'code' => '='
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
