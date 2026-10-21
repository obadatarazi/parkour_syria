<?php

namespace App\Http\Docs\Schemas;

use Attribute;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Currency',
    description: 'Currency schema',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'title', type: 'string', example: 'Syrian Pound'),
        new OA\Property(property: 'symbol', type: 'string', example: 'KD'),
        new OA\Property(property: 'code', type: 'string', example: 'KWD'),
        new OA\Property(property: 'publish', type: 'boolean', example: true),
        new OA\Property(property: 'isDefault', type: 'boolean', example: true),
        new OA\Property(property: 'createdAt', type: 'datetime', example: '2024-07-14 15:19:32'),
        new OA\Property(property: 'updatedAt', type: 'datetime', example: '2024-07-14 15:19:32'),
    ],
    type: 'object'
)]
#[Attribute(Attribute::TARGET_CLASS)]
class CurrencySchema
{
    public function __construct() {}
}
