<?php

namespace App\Enum;

use App\Http\Traits\EnumTrait;

enum OrderStatus: string
{
    use EnumTrait;

    case PENDING = 'PENDING';
    case CONFIRMED = 'CONFIRMED';
    case SHIPPED = 'SHIPPED';
    case COMPLETED = 'COMPLETED';
    case CANCELLED = 'CANCELLED';
}
