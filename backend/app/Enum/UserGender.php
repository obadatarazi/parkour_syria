<?php
namespace App\Enum;

use App\Http\Traits\EnumTrait;

enum UserGender:string
{
    use EnumTrait;

    case MALE = 'MALE';
    case FEMALE = 'FEMALE';
}
