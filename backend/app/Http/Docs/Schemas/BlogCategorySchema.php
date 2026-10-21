<?php

namespace App\Http\Docs\Schemas;

use Attribute;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'BlogCategory',
    description: 'A category of the blog (safety, training, damascus).',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'slug', type: 'string', example: 'safety'),
        new OA\Property(property: 'sortOrder', type: 'integer', example: 1),
        new OA\Property(property: 'publish', type: 'boolean', example: true),
        new OA\Property(property: 'title', type: 'string', example: 'أمان'),
        new OA\Property(property: 'translations', description: 'Dashboard only: the content of every locale, keyed by locale.', type: 'object'),
        new OA\Property(property: 'createdAt', type: 'datetime', example: '2026-10-20 15:19:32'),
        new OA\Property(property: 'updatedAt', type: 'datetime', example: '2026-10-20 15:19:32'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'BlogCategoryStoreFormRequest',
    properties: [
        new OA\Property(property: 'slug', type: 'string', example: 'safety'),
        new OA\Property(property: 'sortOrder', type: 'integer', example: 1),
        new OA\Property(property: 'publish', type: 'boolean', example: true),
        new OA\Property(property: 'translations[ar][title]', type: 'string', example: 'أمان'),
        new OA\Property(property: 'translations[en][title]', type: 'string', example: 'Safety'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'BlogCategoryUpdateFormRequest',
    allOf: [
        new OA\Schema(ref: '#/components/schemas/MethodPutField'),
        new OA\Schema(ref: '#/components/schemas/BlogCategoryStoreFormRequest'),
    ]
)]
#[Attribute(Attribute::TARGET_CLASS)]
class BlogCategorySchema
{
    public function __construct() {}
}
