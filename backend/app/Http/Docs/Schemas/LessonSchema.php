<?php

namespace App\Http\Docs\Schemas;

use Attribute;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Lesson',
    description: 'A lesson of the beginner path, read in sort_order.',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'slug', type: 'string', example: 'safety-first'),
        new OA\Property(property: 'sortOrder', type: 'integer', example: 1),
        new OA\Property(property: 'youtubeUrl', type: 'string', example: 'https://www.youtube.com/watch?v=xxxxxxxxxxx'),
        new OA\Property(property: 'publish', type: 'boolean', example: true),
        new OA\Property(property: 'title', type: 'string', example: 'الأمان أولاً'),
        new OA\Property(property: 'summary', type: 'string', example: 'قواعد أساسية · أماكن آمنة'),
        new OA\Property(property: 'body', type: 'string', example: '<h3>لماذا الأمان أهم؟</h3><p>الهدف هو التحكّم بالجسم.</p>'),
        new OA\Property(property: 'safetyNote', type: 'string', example: 'درس نظري وعملي خفيف. لا تحاول حركات متقدمة.'),
        new OA\Property(property: 'imageFileUrl', type: 'string', example: '/storage/uploads/lessons/Oct-2026/image.jpg', nullable: true),
        new OA\Property(property: 'translations', description: 'Dashboard only: the content of every locale, keyed by locale.', type: 'object'),
        new OA\Property(property: 'createdAt', type: 'datetime', example: '2026-10-20 15:19:32'),
        new OA\Property(property: 'updatedAt', type: 'datetime', example: '2026-10-20 15:19:32'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'LessonStoreFormRequest',
    properties: [
        new OA\Property(property: 'image', type: 'string', format: 'binary'),
        new OA\Property(property: 'slug', type: 'string', example: 'safety-first'),
        new OA\Property(property: 'sortOrder', type: 'integer', example: 1),
        new OA\Property(property: 'youtubeUrl', type: 'string', example: 'https://www.youtube.com/watch?v=xxxxxxxxxxx'),
        new OA\Property(property: 'publish', type: 'boolean', example: true),
        new OA\Property(property: 'translations[ar][title]', type: 'string', example: 'الأمان أولاً'),
        new OA\Property(property: 'translations[en][title]', type: 'string', example: 'Safety first'),
        new OA\Property(property: 'translations[ar][summary]', type: 'string', example: 'قواعد أساسية · أماكن آمنة'),
        new OA\Property(property: 'translations[en][summary]', type: 'string', example: 'Basic rules · Safe places'),
        new OA\Property(property: 'translations[ar][body]', type: 'string', example: '<h3>لماذا الأمان أهم؟</h3><p>الهدف هو التحكّم بالجسم.</p>'),
        new OA\Property(property: 'translations[en][body]', type: 'string', example: '<h3>Why safety matters most</h3><p>The goal is body control.</p>'),
        new OA\Property(property: 'translations[ar][safetyNote]', type: 'string', example: 'درس نظري وعملي خفيف. لا تحاول حركات متقدمة.'),
        new OA\Property(property: 'translations[en][safetyNote]', type: 'string', example: 'A light theory and practice lesson. Do not try advanced moves.'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'LessonUpdateFormRequest',
    allOf: [
        new OA\Schema(ref: '#/components/schemas/MethodPutField'),
        new OA\Schema(ref: '#/components/schemas/LessonStoreFormRequest'),
    ]
)]
#[Attribute(Attribute::TARGET_CLASS)]
class LessonSchema
{
    public function __construct()
    {}
}
