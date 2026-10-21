<?php

namespace App\Http\Docs\Schemas;

use Attribute;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Category',
    description: 'Category schema (dormant shop)',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'publish', type: 'boolean', example: true),
        new OA\Property(property: 'title', type: 'string', example: 'Shoes'),
        new OA\Property(property: 'slug', type: 'string', example: 'shoes'),
        new OA\Property(property: 'description', type: 'string', example: 'Training shoes'),
        new OA\Property(property: 'imageFileUrl', type: 'string', example: 'categories/shoes.jpg'),
        new OA\Property(
            property: 'parentCategory',
            properties: [
                new OA\Property(property: 'id', type: 'integer', example: 1),
                new OA\Property(property: 'title', type: 'string', example: 'Gear'),
            ],
            type: 'object',
            nullable: true
        ),
        new OA\Property(property: 'createdAt', type: 'datetime', example: '2026-10-20 15:19:32'),
        new OA\Property(property: 'updatedAt', type: 'datetime', example: '2026-10-20 15:19:32'),
    ],
    type: 'object'
)]
#[Attribute(Attribute::TARGET_CLASS)]
class CategorySchema
{
    public function __construct() {}
}
