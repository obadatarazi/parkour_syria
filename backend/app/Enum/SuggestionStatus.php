<?php

namespace App\Enum;

use App\Http\Traits\EnumTrait;

enum SuggestionStatus: string
{
    use EnumTrait;

    case PENDING = 'pending';
    case ACCEPTED = 'accepted';
    case REJECTED = 'rejected';
}
