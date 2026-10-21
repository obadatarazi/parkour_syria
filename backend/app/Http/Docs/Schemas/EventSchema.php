<?php

namespace App\Http\Docs\Schemas;

use Attribute;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Event',
    description: 'A workshop or gathering. The website only ever sees the ones that have not started yet.',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'slug', type: 'string', example: 'safety-workshop'),
        new OA\Property(property: 'type', type: 'string', enum: ['workshop', 'gathering'], example: 'workshop'),
        new OA\Property(property: 'startsAt', type: 'datetime', example: '2026-10-24 10:00:00'),
        new OA\Property(property: 'areaId', type: 'integer', example: 1),
        new OA\Property(property: 'contact', type: 'string', example: '963999000111'),
        new OA\Property(property: 'publish', type: 'boolean', example: true),
        new OA\Property(property: 'title', type: 'string', example: 'ورشة أمان للمبتدئين'),
        new OA\Property(property: 'locationLabel', type: 'string', example: 'حديقة تشرين · المزة'),
        new OA\Property(property: 'description', type: 'string', example: 'ورشة لتعلّم أساسيات الأمان.'),
        new OA\Property(property: 'imageFileUrl', type: 'string', example: '/storage/uploads/events/Oct-2026/image.jpg', nullable: true),
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
    schema: 'EventStoreFormRequest',
    properties: [
        new OA\Property(property: 'image', type: 'string', format: 'binary'),
        new OA\Property(property: 'slug', type: 'string', example: 'safety-workshop'),
        new OA\Property(property: 'type', type: 'string', enum: ['workshop', 'gathering'], example: 'workshop'),
        new OA\Property(property: 'startsAt', type: 'datetime', example: '2026-10-24 10:00:00'),
        new OA\Property(property: 'areaId', type: 'integer', example: 1),
        new OA\Property(property: 'contact', type: 'string', example: '963999000111'),
        new OA\Property(property: 'publish', type: 'boolean', example: true),
        new OA\Property(property: 'translations[ar][title]', type: 'string', example: 'ورشة أمان للمبتدئين'),
        new OA\Property(property: 'translations[en][title]', type: 'string', example: 'Beginner safety workshop'),
        new OA\Property(property: 'translations[ar][locationLabel]', type: 'string', example: 'حديقة تشرين · المزة'),
        new OA\Property(property: 'translations[en][locationLabel]', type: 'string', example: 'Tishreen Park · Mazzeh'),
        new OA\Property(property: 'translations[ar][description]', type: 'string', example: 'ورشة لتعلّم أساسيات الأمان.'),
        new OA\Property(property: 'translations[en][description]', type: 'string', example: 'A workshop on safety basics.'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'EventUpdateFormRequest',
    allOf: [
        new OA\Schema(ref: '#/components/schemas/MethodPutField'),
        new OA\Schema(ref: '#/components/schemas/EventStoreFormRequest'),
    ]
)]
#[Attribute(Attribute::TARGET_CLASS)]
class EventSchema
{
    public function __construct() {}
}
