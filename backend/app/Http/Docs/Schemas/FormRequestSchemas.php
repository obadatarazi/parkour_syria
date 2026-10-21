<?php

namespace App\Http\Docs\Schemas;

use Attribute;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'MethodPutField',
    description: 'Laravel method spoofing for multipart update requests',
    properties: [
        new OA\Property(property: '_method', type: 'string', example: 'PUT'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'CurrencyFormRequest',
    properties: [
        new OA\Property(property: 'symbol', type: 'string', example: 'SYP'),
        new OA\Property(property: 'code', type: 'string', example: 'SYP'),
        new OA\Property(property: 'publish', type: 'boolean', example: true),
        new OA\Property(property: 'isDefault', type: 'boolean', example: true),
        new OA\Property(property: 'translations[en][title]', type: 'string', example: 'Syrian Pound'),
        new OA\Property(property: 'translations[ar][title]', type: 'string', example: 'ليرة سورية'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'BrandStoreFormRequest',
    properties: [
        new OA\Property(property: 'logo', type: 'string', format: 'binary'),
        new OA\Property(property: 'publish', type: 'boolean', example: true),
        new OA\Property(property: 'translations[en][title]', type: 'string', example: 'Brand title'),
        new OA\Property(property: 'translations[en][description]', type: 'string', example: 'Brand description'),
        new OA\Property(property: 'translations[ar][title]', type: 'string', example: 'عنوان العلامة'),
        new OA\Property(property: 'translations[ar][description]', type: 'string', example: 'وصف العلامة'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'BrandUpdateFormRequest',
    allOf: [
        new OA\Schema(ref: '#/components/schemas/MethodPutField'),
        new OA\Schema(ref: '#/components/schemas/BrandStoreFormRequest'),
    ]
)]
#[OA\Schema(
    schema: 'CategoryStoreFormRequest',
    properties: [
        new OA\Property(property: 'image', type: 'string', format: 'binary'),
        new OA\Property(property: 'publish', type: 'boolean', example: true),
        new OA\Property(property: 'parentCategoryId', type: 'integer', example: 1),
        new OA\Property(property: 'translations[ar][title]', type: 'string', example: 'معدات'),
        new OA\Property(property: 'translations[ar][description]', type: 'string', example: 'معدات تدريب'),
        new OA\Property(property: 'translations[en][title]', type: 'string', example: 'Gear'),
        new OA\Property(property: 'translations[en][description]', type: 'string', example: 'Training gear'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'CategoryUpdateFormRequest',
    allOf: [
        new OA\Schema(ref: '#/components/schemas/MethodPutField'),
        new OA\Schema(ref: '#/components/schemas/CategoryStoreFormRequest'),
    ]
)]
#[OA\Schema(
    schema: 'UserStoreFormRequest',
    properties: [
        new OA\Property(property: 'avatar', type: 'string', format: 'binary'),
        new OA\Property(property: 'fullName', type: 'string', example: 'Content Editor'),
        new OA\Property(property: 'email', type: 'string', example: 'editor@parkoursyria.com'),
        new OA\Property(property: 'password', type: 'string', example: 'password123'),
        new OA\Property(property: 'passwordConfirmation', type: 'string', example: 'password123'),
        new OA\Property(property: 'phoneNumber', type: 'string', example: '963999000111'),
        new OA\Property(property: 'gender', type: 'string', enum: ['MALE', 'FEMALE'], example: 'MALE'),
        new OA\Property(property: 'type', type: 'string', enum: ['ADMIN'], example: 'ADMIN'),
        new OA\Property(property: 'active', type: 'boolean', example: true),
        new OA\Property(property: 'roles[]', type: 'integer', example: 2),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'UserUpdateFormRequest',
    allOf: [
        new OA\Schema(ref: '#/components/schemas/MethodPutField'),
        new OA\Schema(ref: '#/components/schemas/UserStoreFormRequest'),
    ]
)]
#[OA\Schema(
    schema: 'TagStoreFormRequest',
    properties: [
        new OA\Property(property: 'publish', type: 'boolean', example: true),
        new OA\Property(property: 'translations[en][title]', type: 'string', example: 'Tag title'),
        new OA\Property(property: 'translations[ar][title]', type: 'string', example: 'عنوان الوسم'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'TagUpdateFormRequest',
    allOf: [
        new OA\Schema(ref: '#/components/schemas/TagStoreFormRequest'),
    ]
)]
#[Attribute(Attribute::TARGET_CLASS)]
class FormRequestSchemas
{
    public function __construct() {}
}
