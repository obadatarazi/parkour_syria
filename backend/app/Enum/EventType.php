<?php

namespace App\Enum;

use App\Http\Traits\EnumTrait;

enum EventType: string
{
    use EnumTrait;

    case WORKSHOP = 'workshop';
    case GATHERING = 'gathering';
}
