<?php

namespace App\Http\Docs\Schemas;

use Attribute;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Slider',
    description: 'A hero slide of the home page.',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'sortOrder', type: 'integer', example: 1),
        new OA\Property(property: 'publish', type: 'boolean', example: true),
        new OA\Property(property: 'primaryPage', type: 'string', example: 'path'),
        new OA\Property(property: 'secondaryPage', type: 'string', example: 'directory'),
        new OA\Property(property: 'badge', type: 'string', example: 'تدريب · للجميع'),
        new OA\Property(property: 'title', type: 'string', example: 'تدرّبوا معاً — ابدأوا من الأمان في دمشق'),
        new OA\Property(property: 'description', type: 'string', example: 'مسار واضح للمبتدئين، أماكن تدريب، ومدربون موثوقون.'),
        new OA\Property(property: 'primaryButtonText', type: 'string', example: 'مسار المبتدئ'),
        new OA\Property(property: 'secondaryButtonText', type: 'string', example: 'الدليل'),
        new OA\Property(property: 'imageFileUrl', type: 'string', example: '/storage/uploads/sliders/Oct-2026/image.jpg', nullable: true),
        new OA\Property(property: 'translations', description: 'Dashboard only: the content of every locale, keyed by locale.', type: 'object'),
        new OA\Property(property: 'createdAt', type: 'datetime', example: '2026-10-20 15:19:32'),
        new OA\Property(property: 'updatedAt', type: 'datetime', example: '2026-10-20 15:19:32'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'SliderStoreFormRequest',
    properties: [
        new OA\Property(property: 'image', type: 'string', format: 'binary'),
        new OA\Property(property: 'sortOrder', type: 'integer', example: 1),
        new OA\Property(property: 'publish', type: 'boolean', example: true),
        new OA\Property(property: 'primaryPage', type: 'string', example: 'path'),
        new OA\Property(property: 'secondaryPage', type: 'string', example: 'directory'),
        new OA\Property(property: 'translations[ar][badge]', type: 'string', example: 'تدريب · للجميع'),
        new OA\Property(property: 'translations[en][badge]', type: 'string', example: 'Training · For everyone'),
        new OA\Property(property: 'translations[ar][title]', type: 'string', example: 'تدرّبوا معاً — ابدأوا من الأمان في دمشق'),
        new OA\Property(property: 'translations[en][title]', type: 'string', example: 'Train together — start with safety in Damascus'),
        new OA\Property(property: 'translations[ar][description]', type: 'string', example: 'مسار واضح للمبتدئين، أماكن تدريب، ومدربون موثوقون.'),
        new OA\Property(property: 'translations[en][description]', type: 'string', example: 'A clear beginner path, training spots, and trusted coaches.'),
        new OA\Property(property: 'translations[ar][primaryButtonText]', type: 'string', example: 'مسار المبتدئ'),
        new OA\Property(property: 'translations[en][primaryButtonText]', type: 'string', example: 'Beginner path'),
        new OA\Property(property: 'translations[ar][secondaryButtonText]', type: 'string', example: 'الدليل'),
        new OA\Property(property: 'translations[en][secondaryButtonText]', type: 'string', example: 'Directory'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'SliderUpdateFormRequest',
    allOf: [
        new OA\Schema(ref: '#/components/schemas/MethodPutField'),
        new OA\Schema(ref: '#/components/schemas/SliderStoreFormRequest'),
    ]
)]
#[Attribute(Attribute::TARGET_CLASS)]
class SliderSchema
{
    public function __construct() {}
}
