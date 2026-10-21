<?php

namespace App\Http\Docs\Schemas;

use Attribute;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Page',
    description: 'A fixed page of the site (home, what, about, contact, disclaimer, book), found by its key.',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'key', type: 'string', example: 'about'),
        new OA\Property(property: 'publish', type: 'boolean', example: true),
        new OA\Property(property: 'title', type: 'string', example: 'من نحن'),
        new OA\Property(property: 'body', type: 'string', example: '<p>باركور سوريا منصة سورية مرتبطة بـ Parkour.com.</p>'),
        new OA\Property(property: 'seoTitle', type: 'string', example: 'من نحن | باركور سوريا'),
        new OA\Property(property: 'seoDescription', type: 'string', example: 'تعرّف على باركور سوريا.'),
        new OA\Property(property: 'imageFileUrl', type: 'string', example: '/storage/uploads/pages/Oct-2026/image.jpg', nullable: true),
        new OA\Property(property: 'translations', description: 'Dashboard only: the content of every locale, keyed by locale.', type: 'object'),
        new OA\Property(property: 'createdAt', type: 'datetime', example: '2026-10-20 15:19:32'),
        new OA\Property(property: 'updatedAt', type: 'datetime', example: '2026-10-20 15:19:32'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'PageStoreFormRequest',
    properties: [
        new OA\Property(property: 'image', type: 'string', format: 'binary'),
        new OA\Property(property: 'publish', type: 'boolean', example: true),
        new OA\Property(property: 'translations[ar][title]', type: 'string', example: 'من نحن'),
        new OA\Property(property: 'translations[en][title]', type: 'string', example: 'About us'),
        new OA\Property(property: 'translations[ar][body]', type: 'string', example: '<p>باركور سوريا منصة سورية مرتبطة بـ Parkour.com.</p>'),
        new OA\Property(property: 'translations[en][body]', type: 'string', example: '<p>Parkour Syria is affiliated with Parkour.com.</p>'),
        new OA\Property(property: 'translations[ar][seoTitle]', type: 'string', example: 'من نحن | باركور سوريا'),
        new OA\Property(property: 'translations[en][seoTitle]', type: 'string', example: 'About | Parkour Syria'),
        new OA\Property(property: 'translations[ar][seoDescription]', type: 'string', example: 'تعرّف على باركور سوريا.'),
        new OA\Property(property: 'translations[en][seoDescription]', type: 'string', example: 'Get to know Parkour Syria.'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'PageUpdateFormRequest',
    allOf: [
        new OA\Schema(ref: '#/components/schemas/MethodPutField'),
        new OA\Schema(ref: '#/components/schemas/PageStoreFormRequest'),
    ]
)]
#[Attribute(Attribute::TARGET_CLASS)]
class PageSchema
{
    public function __construct()
    {}
}
