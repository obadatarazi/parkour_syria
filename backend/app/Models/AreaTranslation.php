<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class AreaTranslation extends BaseModel
{
    use HasFactory;

    public $timestamps = false;
    protected $fillable = [
        'name',
    ];
}
