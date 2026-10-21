<?php

namespace App\Http\Docs\Schemas;

use Attribute;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Area',
    description: 'A neighbourhood the directory and events are filed under.',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'slug', type: 'string', example: 'mazzeh'),
        new OA\Property(property: 'sortOrder', type: 'integer', example: 1),
        new OA\Property(property: 'publish', type: 'boolean', example: true),
        new OA\Property(property: 'name', type: 'string', example: 'المزة'),
        new OA\Property(property: 'translations', description: 'Dashboard only: the content of every locale, keyed by locale.', type: 'object'),
        new OA\Property(property: 'createdAt', type: 'datetime', example: '2026-10-20 15:19:32'),
        new OA\Property(property: 'updatedAt', type: 'datetime', example: '2026-10-20 15:19:32'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'AreaStoreFormRequest',
    properties: [
        new OA\Property(property: 'slug', type: 'string', example: 'mazzeh'),
        new OA\Property(property: 'sortOrder', type: 'integer', example: 1),
        new OA\Property(property: 'publish', type: 'boolean', example: true),
        new OA\Property(property: 'translations[ar][name]', type: 'string', example: 'المزة'),
        new OA\Property(property: 'translations[en][name]', type: 'string', example: 'Mazzeh'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'AreaUpdateFormRequest',
    allOf: [
        new OA\Schema(ref: '#/components/schemas/MethodPutField'),
        new OA\Schema(ref: '#/components/schemas/AreaStoreFormRequest'),
    ]
)]
#[Attribute(Attribute::TARGET_CLASS)]
class AreaSchema
{
    public function __construct() {}
}
