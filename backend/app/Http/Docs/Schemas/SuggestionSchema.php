<?php

namespace App\Http\Docs\Schemas;

use Attribute;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Suggestion',
    description: 'A place, coach, team or event proposed from the website, waiting for review.',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'type', type: 'string', enum: ['place', 'coach', 'team', 'event'], example: 'place'),
        new OA\Property(property: 'status', type: 'string', enum: ['pending', 'accepted', 'rejected'], example: 'pending'),
        new OA\Property(property: 'name', type: 'string', example: 'حديقة الجلاء'),
        new OA\Property(
            property: 'area',
            properties: [
                new OA\Property(property: 'id', type: 'integer', example: 1),
                new OA\Property(property: 'slug', type: 'string', example: 'abu-rummaneh'),
                new OA\Property(property: 'name', type: 'string', example: 'أبو رمانة'),
            ],
            type: 'object',
            nullable: true
        ),
        new OA\Property(property: 'description', type: 'string', example: 'مساحة مناسبة لتمارين التوازن.', nullable: true),
        new OA\Property(property: 'contact', type: 'string', example: '963999000666', nullable: true),
        new OA\Property(property: 'startsAt', type: 'datetime', example: '2026-11-01 09:00:00', nullable: true),
        new OA\Property(property: 'proposerName', type: 'string', example: 'سامي', nullable: true),
        new OA\Property(property: 'proposerContact', type: 'string', example: '963999000777', nullable: true),
        new OA\Property(property: 'payload', type: 'object', nullable: true),
        new OA\Property(property: 'safetyAccepted', type: 'boolean', example: true),
        new OA\Property(property: 'rejectReason', type: 'string', example: null, nullable: true),
        new OA\Property(property: 'reviewedAt', type: 'datetime', example: null, nullable: true),
        new OA\Property(property: 'promotedType', type: 'string', enum: ['directory_entries', 'events'], example: null, nullable: true),
        new OA\Property(property: 'promotedId', type: 'integer', example: null, nullable: true),
        new OA\Property(property: 'createdAt', type: 'datetime', example: '2026-10-20 15:19:32'),
        new OA\Property(property: 'updatedAt', type: 'datetime', example: '2026-10-20 15:19:32'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'SuggestionStoreFormRequest',
    required: ['type', 'name', 'safetyAccepted'],
    properties: [
        new OA\Property(property: 'type', type: 'string', enum: ['place', 'coach', 'team', 'event'], example: 'place'),
        new OA\Property(property: 'name', type: 'string', example: 'حديقة الجلاء'),
        new OA\Property(property: 'areaId', type: 'integer', example: 2),
        new OA\Property(property: 'description', type: 'string', example: 'مساحة مناسبة لتمارين التوازن.'),
        new OA\Property(property: 'contact', type: 'string', example: '963999000666'),
        new OA\Property(property: 'startsAt', description: 'Required when type is event.', type: 'string', format: 'date-time', example: '2026-11-01 09:00:00'),
        new OA\Property(property: 'proposerName', type: 'string', example: 'سامي'),
        new OA\Property(property: 'proposerContact', type: 'string', example: '963999000777'),
        new OA\Property(property: 'safetyAccepted', description: 'The visitor confirms the place is safe and not a damaged building.', type: 'boolean', example: true),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'SuggestionAcceptFormRequest',
    properties: [
        new OA\Property(property: 'publish', description: 'Publish the created entry right away. Defaults to true.', type: 'boolean', example: true),
        new OA\Property(property: 'verified', description: 'Directory entries only. Defaults to false.', type: 'boolean', example: false),
        new OA\Property(property: 'slug', type: 'string', example: 'jalaa-park'),
        new OA\Property(property: 'eventType', description: 'Events only. Defaults to gathering.', type: 'string', enum: ['workshop', 'gathering'], example: 'workshop'),
        new OA\Property(property: 'startsAt', description: 'Events only. Overrides the proposed date.', type: 'string', format: 'date-time', example: '2026-11-01 09:00:00'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'SuggestionRejectFormRequest',
    required: ['rejectReason'],
    properties: [
        new OA\Property(property: 'rejectReason', type: 'string', example: 'المبنى متضرر ولا يمكن إدراجه.'),
    ],
    type: 'object'
)]
#[Attribute(Attribute::TARGET_CLASS)]
class SuggestionSchema
{
    public function __construct()
    {}
}
