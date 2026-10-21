<?php

namespace App\Http\Docs\Schemas;

use Attribute;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Coupon',
    description: 'Dormant shop coupon (FEATURE_ECOMMERCE)',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'code', type: 'string', example: 'PARKOUR10'),
        new OA\Property(property: 'type', type: 'string', enum: ['PERCENTAGE', 'FIXED'], example: 'PERCENTAGE'),
        new OA\Property(property: 'value', type: 'number', format: 'float', example: 10),
        new OA\Property(property: 'startsAt', type: 'datetime', example: '2026-11-01 00:00:00', nullable: true),
        new OA\Property(property: 'endsAt', type: 'datetime', example: '2026-12-01 00:00:00', nullable: true),
        new OA\Property(property: 'usageLimit', type: 'integer', example: 100, nullable: true),
        new OA\Property(property: 'publish', type: 'boolean', example: false),
        new OA\Property(property: 'createdAt', type: 'datetime', example: '2026-10-20 15:19:32'),
        new OA\Property(property: 'updatedAt', type: 'datetime', example: '2026-10-20 15:19:32'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'CouponFormRequest',
    properties: [
        new OA\Property(property: 'code', type: 'string', example: 'PARKOUR10'),
        new OA\Property(property: 'type', type: 'string', enum: ['PERCENTAGE', 'FIXED'], example: 'PERCENTAGE'),
        new OA\Property(property: 'value', type: 'number', format: 'float', example: 10),
        new OA\Property(property: 'startsAt', type: 'string', format: 'date-time', example: '2026-11-01 00:00:00'),
        new OA\Property(property: 'endsAt', type: 'string', format: 'date-time', example: '2026-12-01 00:00:00'),
        new OA\Property(property: 'usageLimit', type: 'integer', example: 100),
        new OA\Property(property: 'publish', type: 'boolean', example: false),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'Order',
    description: 'Dormant shop order (FEATURE_ECOMMERCE)',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'orderRefNumber', type: 'string', example: 'PS-20261020-0001'),
        new OA\Property(property: 'status', type: 'string', enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'COMPLETED', 'CANCELLED'], example: 'PENDING'),
        new OA\Property(property: 'customerName', type: 'string', example: 'سامي', nullable: true),
        new OA\Property(property: 'customerPhone', type: 'string', example: '963999000777', nullable: true),
        new OA\Property(property: 'subtotal', type: 'number', format: 'float', example: 15.5),
        new OA\Property(property: 'discount', type: 'number', format: 'float', example: 0),
        new OA\Property(property: 'total', type: 'number', format: 'float', example: 15.5),
        new OA\Property(property: 'items', type: 'array', items: new OA\Items(type: 'object')),
        new OA\Property(property: 'createdAt', type: 'datetime', example: '2026-10-20 15:19:32'),
        new OA\Property(property: 'updatedAt', type: 'datetime', example: '2026-10-20 15:19:32'),
    ],
    type: 'object'
)]
#[OA\Schema(
    schema: 'OrderStatusFormRequest',
    required: ['status'],
    properties: [
        new OA\Property(property: 'status', type: 'string', enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'COMPLETED', 'CANCELLED'], example: 'CONFIRMED'),
        new OA\Property(property: 'note', type: 'string', example: 'Delivered by hand'),
    ],
    type: 'object'
)]
#[Attribute(Attribute::TARGET_CLASS)]
class ShopSchemas
{
    public function __construct() {}
}
