<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class PageTranslation extends BaseModel
{
    use HasFactory;

    public $timestamps = false;
    protected $fillable = [
        'title',
        'body',
        'seo_title',
        'seo_description',
    ];
}
