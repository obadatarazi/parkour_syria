<?php

namespace App\Http\Docs\Schemas;

use Attribute;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'BlogPost',
    description: 'An article. Unpublished posts are drafts and never reach the website.',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'slug', type: 'string', example: 'safety-rules'),
        new OA\Property(property: 'blogCategoryId', type: 'integer', example: 1),
        new OA\Property(property: 'publish', type: 'boolean', example: true),
        new OA\Property(property: 'publishedAt', type: 'datetime', example: '2026-10-05 09:00:00'),
        new OA\Property(property: 'title', type: 'string', example: '5 قواعد أمان لا غنى عنها للمبتدئ'),
        new OA\Property(property: 'excerpt', type: 'string', example: 'قبل أن تقفز أو تتدحرج — القواعد الأساسية لكل تدريب.'),
        new OA\Property(property: 'body', type: 'string', example: '<h3>1. تدرّج دائماً</h3><p>ابدأ من الأرض ثم ارتفاعات منخفضة جداً.</p>'),
        new OA\Property(property: 'author', type: 'string', example: 'فريق باركور سوريا', nullable: true),
        new OA\Property(property: 'seoTitle', type: 'string', example: '5 قواعد أمان للمبتدئ | باركور سوريا'),
        new OA\Property(property: 'seoDescription', type: 'string', example: 'القواعد الأساسية للتدريب الآمن.'),
        new OA\Property(property: 'imageFileUrl', type: 'string', example: '/storage/uploads/blog-posts/Oct-2026/image.jpg', nullable: true),
        new OA\Property(
            property: 'category',
            properties: [
                new OA\Property(property: 'id', type: 'integer', example: 1),
                new OA\Property(property: 'slug', type: 'string', example: 'mazzeh'),
                new OA\Property(property: 'title', type: 'string', example: 'المزة'),
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
    schema: 'BlogPostStoreFormRequest',
    properties: [
        new OA\Property(property: 'image', type: 'string', format: 'binary'),
        new OA\Property(property: 'slug', type: 'string', example: 'safety-rules'),
        new OA\Property(property: 'blogCategoryId', type: 'integer', example: 1),
        new OA\Property(property: 'publish', type: 'boolean', example: true),
        new OA\Property(property: 'publishedAt', type: 'datetime', example: '2026-10-05 09:00:00'),
        new OA\Property(property: 'translations[ar][title]', type: 'string', example: '5 قواعد أمان لا غنى عنها للمبتدئ'),
        new OA\Property(property: 'translations[en][title]', type: 'string', example: '5 essential safety rules for beginners'),
        new OA\Property(property: 'translations[ar][excerpt]', type: 'string', example: 'قبل أن تقفز أو تتدحرج — القواعد الأساسية لكل تدريب.'),
        new OA\Property(property: 'translations[en][excerpt]', type: 'string', example: 'Before you jump or roll — the basics for every session.'),
        new OA\Property(property: 'translations[ar][body]', type: 'string', example: '<h3>1. تدرّج دائماً</h3><p>ابدأ من الأرض ثم ارتفاعات منخفضة جداً.</p>'),
        new OA\Property(property: 'translations[en][body]', type: 'string', example: '<h3>1. Always progress gradually</h3><p>Start on the ground, then very low heights.</p>'),
        new OA\Property(property: 'translations[ar][author]', type: 'string', example: 'فريق باركور سوريا'),
        new OA\Property(property: 'translations[en][author]', type: 'string', example: 'Parkour Syria team'),
        new OA\Property(property: 'translations[ar][seoTitle]', type: 'string', example: '5 قواعد أمان للمبتدئ | باركور سوريا'),
        new OA\Property(property: 'translations[en][seoTitle]', type: 'string', example: '5 safety rules for beginners | Parkour Syria'),
        new OA\Property(property: 'translations[ar][seoDescription]', type: 'string', example: 'القواعد الأساسية للتدريب الآمن.'),
        new OA\Property(property: 'translations[en][seoDescription]', type: 'string', example: 'The basics of training safely.'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'BlogPostUpdateFormRequest',
    allOf: [
        new OA\Schema(ref: '#/components/schemas/MethodPutField'),
        new OA\Schema(ref: '#/components/schemas/BlogPostStoreFormRequest'),
    ]
)]
#[Attribute(Attribute::TARGET_CLASS)]
class BlogPostSchema
{
    public function __construct() {}
}
