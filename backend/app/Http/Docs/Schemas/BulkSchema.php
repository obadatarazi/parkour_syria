<?php

namespace App\Http\Docs\Schemas;

use Attribute;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'BulkDeleteFormRequest',
    description: 'The identifiers to delete in one call.',
    required: ['ids'],
    properties: [
        new OA\Property(
            property: 'ids',
            description: 'The ids to delete. Duplicated ids are collapsed, unknown ids are reported back untouched.',
            type: 'array',
            items: new OA\Items(type: 'integer'),
            example: [1, 2, 3]
        ),
    ]
)]
#[OA\Schema(
    schema: 'BulkDeleteResult',
    description: 'What a bulk delete did: the ids it removed, and the ids it could not find.',
    properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(
            property: 'data',
            properties: [
                new OA\Property(property: 'deletedCount', type: 'integer', example: 2),
                new OA\Property(
                    property: 'deletedIds',
                    type: 'array',
                    items: new OA\Items(type: 'integer'),
                    example: [1, 2]
                ),
                new OA\Property(
                    property: 'notFoundIds',
                    type: 'array',
                    items: new OA\Items(type: 'integer'),
                    example: [3]
                ),
            ],
            type: 'object'
        ),
    ]
)]
#[Attribute(Attribute::TARGET_CLASS)]
class BulkSchema
{
    public function __construct() {}
}
