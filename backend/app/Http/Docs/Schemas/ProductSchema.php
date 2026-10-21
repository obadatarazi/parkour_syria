<?php

namespace App\Http\Docs\Schemas;

use Attribute;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Product',
    description: 'Dormant shop product (FEATURE_ECOMMERCE). The parkour book is the first candidate.',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'slug', type: 'string', example: 'parkour-book'),
        new OA\Property(property: 'skuCode', type: 'string', example: 'BOOK-001'),
        new OA\Property(property: 'brandId', type: 'integer', example: 1),
        new OA\Property(property: 'categoryId', type: 'integer', example: 1),
        new OA\Property(property: 'price', type: 'number', format: 'float', example: 15.5),
        new OA\Property(property: 'stock', type: 'integer', example: 100),
        new OA\Property(property: 'publish', type: 'boolean', example: true),
        new OA\Property(property: 'title', type: 'string', example: 'كتاب الباركور'),
        new OA\Property(property: 'description', type: 'string', example: '<p>دليل المبتدئ الآمن.</p>'),
        new OA\Property(property: 'imageFileUrl', type: 'string', example: '/storage/uploads/products/Oct-2026/image.jpg', nullable: true),
        new OA\Property(property: 'translations', description: 'Dashboard only: the content of every locale, keyed by locale.', type: 'object'),
        new OA\Property(property: 'createdAt', type: 'datetime', example: '2026-10-20 15:19:32'),
        new OA\Property(property: 'updatedAt', type: 'datetime', example: '2026-10-20 15:19:32'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'ProductStoreFormRequest',
    properties: [
        new OA\Property(property: 'image', type: 'string', format: 'binary'),
        new OA\Property(property: 'slug', type: 'string', example: 'parkour-book'),
        new OA\Property(property: 'skuCode', type: 'string', example: 'BOOK-001'),
        new OA\Property(property: 'brandId', type: 'integer', example: 1),
        new OA\Property(property: 'categoryId', type: 'integer', example: 1),
        new OA\Property(property: 'price', type: 'number', format: 'float', example: 15.5),
        new OA\Property(property: 'stock', type: 'integer', example: 100),
        new OA\Property(property: 'publish', type: 'boolean', example: true),
        new OA\Property(property: 'translations[ar][title]', type: 'string', example: 'كتاب الباركور'),
        new OA\Property(property: 'translations[en][title]', type: 'string', example: 'The parkour book'),
        new OA\Property(property: 'translations[ar][description]', type: 'string', example: '<p>دليل المبتدئ الآمن.</p>'),
        new OA\Property(property: 'translations[en][description]', type: 'string', example: '<p>The safe beginner guide.</p>'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'ProductUpdateFormRequest',
    allOf: [
        new OA\Schema(ref: '#/components/schemas/MethodPutField'),
        new OA\Schema(ref: '#/components/schemas/ProductStoreFormRequest'),
    ]
)]
#[Attribute(Attribute::TARGET_CLASS)]
class ProductSchema
{
    public function __construct() {}
}
