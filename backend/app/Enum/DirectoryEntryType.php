<?php

namespace App\Enum;

use App\Http\Traits\EnumTrait;

enum DirectoryEntryType: string
{
    use EnumTrait;

    case PLACE = 'place';
    case COACH = 'coach';
    case TEAM = 'team';
}
