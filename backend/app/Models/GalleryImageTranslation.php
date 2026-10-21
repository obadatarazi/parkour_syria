<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class GalleryImageTranslation extends BaseModel
{
    use HasFactory;

    public $timestamps = false;
    protected $fillable = [
        'caption',
    ];
}
