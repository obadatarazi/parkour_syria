<?php

namespace App\Http\Docs\Schemas;

use Attribute;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Tag',
    description: 'Tag schema',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'publish', type: 'boolean', example: true),
        new OA\Property(property: 'title', type: 'string', example: 'Tag title'),
        new OA\Property(property: 'slug', type: 'string', example: 'tag-title'),
        new OA\Property(property: 'createdAt', type: 'datetime', example: '2024-07-14 15:19:32'),
        new OA\Property(property: 'updatedAt', type: 'datetime', example: '2024-07-14 15:19:32'),
    ],
    type: 'object'
)]
#[Attribute(Attribute::TARGET_CLASS)]
class TagSchema
{
    public function __construct()
    {}
}
