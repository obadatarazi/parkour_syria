<?php

namespace App\Http\Docs\Schemas;

use Attribute;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'GalleryImage',
    description: 'A photo of the home page gallery.',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'sortOrder', type: 'integer', example: 1),
        new OA\Property(property: 'publish', type: 'boolean', example: true),
        new OA\Property(property: 'caption', type: 'string', example: 'قفزة في المدينة'),
        new OA\Property(property: 'imageFileUrl', type: 'string', example: '/storage/uploads/gallery-images/Oct-2026/image.jpg', nullable: true),
        new OA\Property(property: 'translations', description: 'Dashboard only: the content of every locale, keyed by locale.', type: 'object'),
        new OA\Property(property: 'createdAt', type: 'datetime', example: '2026-10-20 15:19:32'),
        new OA\Property(property: 'updatedAt', type: 'datetime', example: '2026-10-20 15:19:32'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'GalleryImageStoreFormRequest',
    properties: [
        new OA\Property(property: 'image', type: 'string', format: 'binary'),
        new OA\Property(property: 'sortOrder', type: 'integer', example: 1),
        new OA\Property(property: 'publish', type: 'boolean', example: true),
        new OA\Property(property: 'translations[ar][caption]', type: 'string', example: 'قفزة في المدينة'),
        new OA\Property(property: 'translations[en][caption]', type: 'string', example: 'City jump'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'GalleryImageUpdateFormRequest',
    allOf: [
        new OA\Schema(ref: '#/components/schemas/MethodPutField'),
        new OA\Schema(ref: '#/components/schemas/GalleryImageStoreFormRequest'),
    ]
)]
#[Attribute(Attribute::TARGET_CLASS)]
class GalleryImageSchema
{
    public function __construct() {}
}
