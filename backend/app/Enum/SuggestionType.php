<?php

namespace App\Enum;

use App\Http\Traits\EnumTrait;

enum SuggestionType: string
{
    use EnumTrait;

    case PLACE = 'place';
    case COACH = 'coach';
    case TEAM = 'team';
    case EVENT = 'event';

    /**
     * What an accepted suggestion of this type becomes.
     */
    public function isEvent(): bool
    {
        return $this === self::EVENT;
    }
}
