<?php

namespace App\Http\Docs\Schemas;

use Attribute;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Permission',
    description: 'Permission schema',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'name', type: 'string', example: 'permission-name'),
    ],
    type: 'object'
)]
#[Attribute(Attribute::TARGET_CLASS)]
class PermissionSchema
{
    public function __construct()
    {}
}
