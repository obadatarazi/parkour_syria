<?php

namespace App\Enum;

use App\Http\Traits\EnumTrait;

enum UserType: string
{
    use EnumTrait;

    case ADMIN = 'ADMIN';
    case CUSTOMER = 'CUSTOMER';
}
