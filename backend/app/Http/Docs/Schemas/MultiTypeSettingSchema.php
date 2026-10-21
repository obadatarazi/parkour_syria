<?php

namespace App\Http\Docs\Schemas;

use Attribute;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'MultiTypeSetting',
    description: 'MultiTypeSetting schema',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'settingKey', type: 'string', example: 'FACEBOOK_LINK'),
        new OA\Property(property: 'value', type: 'string', example: 'https://www.facebook.com'),
        new OA\Property(property: 'type', type: 'string', example: 'LINK'),
        new OA\Property(property: 'description', type: 'string', example: 'description multi type setting'),
        new OA\Property(property: 'createdAt', type: 'datetime', example: '2024-07-14 15:19:32'),
        new OA\Property(property: 'updatedAt', type: 'datetime', example: '2024-07-14 15:19:32'),
    ],
    type: 'object'
)]
#[Attribute(Attribute::TARGET_CLASS)]
class MultiTypeSettingSchema
{
    public function __construct()
    {}
}
