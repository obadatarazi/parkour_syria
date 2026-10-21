<?php

namespace App\Enum;

use App\Http\Traits\EnumTrait;

enum MultiTypeSettingEnum: string
{
    use EnumTrait;

    case EMAIL = 'EMAIL';
    case LINK = 'LINK';
    case NUMBER = 'NUMBER';
    case PHONE_NUMBER = 'PHONE_NUMBER';
    case TEXT = 'TEXT';
    case PERCENTAGE = 'PERCENTAGE';
    case BOOLEAN = 'BOOLEAN';
}
