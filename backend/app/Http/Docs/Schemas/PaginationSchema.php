<?php

namespace App\Http\Docs\Schemas;

use Attribute;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Pagination',
    description: 'Pagination schema',
    properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(
            property: 'pagination',
            properties: [
                new OA\Property(property: 'page', type: 'integer', example: 1),
                new OA\Property(property: 'pages', type: 'integer', example: 10),
                new OA\Property(property: 'totalItems', type: 'integer', example: 200),
            ],
            type: 'object'
        ),
    ]
)]
#[Attribute(Attribute::TARGET_CLASS)]
class PaginationSchema
{
    public function __construct()
    {}
}
