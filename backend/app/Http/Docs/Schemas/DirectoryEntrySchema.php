<?php

namespace App\Http\Docs\Schemas;

use Attribute;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'DirectoryEntry',
    description: 'A place, coach or team of the directory.',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'slug', type: 'string', example: 'tishreen-park'),
        new OA\Property(property: 'type', type: 'string', enum: ['place', 'coach', 'team'], example: 'place'),
        new OA\Property(property: 'areaId', type: 'integer', example: 1),
        new OA\Property(property: 'whatsapp', type: 'string', example: '963999000111'),
        new OA\Property(property: 'facebookUrl', type: 'string', example: 'https://facebook.com/parkoursyria'),
        new OA\Property(property: 'instagramUrl', type: 'string', example: 'https://instagram.com/parkoursyria'),
        new OA\Property(property: 'mapUrl', type: 'string', example: 'https://maps.google.com/?q=33.5,36.27'),
        new OA\Property(property: 'verified', type: 'boolean', example: true),
        new OA\Property(property: 'publish', type: 'boolean', example: true),
        new OA\Property(property: 'sortOrder', type: 'integer', example: 0),
        new OA\Property(property: 'name', type: 'string', example: 'حديقة تشرين · منطقة التدريب'),
        new OA\Property(property: 'description', type: 'string', example: 'مساحة مفتوحة مناسبة للمبتدئين.'),
        new OA\Property(property: 'imageFileUrl', type: 'string', example: '/storage/uploads/directory-entries/Oct-2026/image.jpg', nullable: true),
        new OA\Property(
            property: 'area',
            properties: [
                new OA\Property(property: 'id', type: 'integer', example: 1),
                new OA\Property(property: 'slug', type: 'string', example: 'mazzeh'),
                new OA\Property(property: 'name', type: 'string', example: 'المزة'),
            ],
            type: 'object',
            nullable: true
        ),
        new OA\Property(property: 'translations', description: 'Dashboard only: the content of every locale, keyed by locale.', type: 'object'),
        new OA\Property(property: 'createdAt', type: 'datetime', example: '2026-10-20 15:19:32'),
        new OA\Property(property: 'updatedAt', type: 'datetime', example: '2026-10-20 15:19:32'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'DirectoryEntryStoreFormRequest',
    properties: [
        new OA\Property(property: 'image', type: 'string', format: 'binary'),
        new OA\Property(property: 'slug', type: 'string', example: 'tishreen-park'),
        new OA\Property(property: 'type', type: 'string', enum: ['place', 'coach', 'team'], example: 'place'),
        new OA\Property(property: 'areaId', type: 'integer', example: 1),
        new OA\Property(property: 'whatsapp', type: 'string', example: '963999000111'),
        new OA\Property(property: 'facebookUrl', type: 'string', example: 'https://facebook.com/parkoursyria'),
        new OA\Property(property: 'instagramUrl', type: 'string', example: 'https://instagram.com/parkoursyria'),
        new OA\Property(property: 'mapUrl', type: 'string', example: 'https://maps.google.com/?q=33.5,36.27'),
        new OA\Property(property: 'verified', type: 'boolean', example: true),
        new OA\Property(property: 'publish', type: 'boolean', example: true),
        new OA\Property(property: 'sortOrder', type: 'integer', example: 0),
        new OA\Property(property: 'translations[ar][name]', type: 'string', example: 'حديقة تشرين · منطقة التدريب'),
        new OA\Property(property: 'translations[en][name]', type: 'string', example: 'Tishreen Park · Training area'),
        new OA\Property(property: 'translations[ar][description]', type: 'string', example: 'مساحة مفتوحة مناسبة للمبتدئين.'),
        new OA\Property(property: 'translations[en][description]', type: 'string', example: 'An open space suitable for beginners.'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'DirectoryEntryUpdateFormRequest',
    allOf: [
        new OA\Schema(ref: '#/components/schemas/MethodPutField'),
        new OA\Schema(ref: '#/components/schemas/DirectoryEntryStoreFormRequest'),
    ]
)]
#[Attribute(Attribute::TARGET_CLASS)]
class DirectoryEntrySchema
{
    public function __construct() {}
}
