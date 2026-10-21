<?php

namespace App\Http\Docs\Schemas;

use Attribute;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Role',
    description: 'Role schema',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'name', type: 'string', example: 'role-name'),
        new OA\Property(property: 'standard', type: 'boolean', example: true),
    ],
    type: 'object'
)]
#[Attribute(Attribute::TARGET_CLASS)]
class RoleSchema
{
    public function __construct()
    {}
}
