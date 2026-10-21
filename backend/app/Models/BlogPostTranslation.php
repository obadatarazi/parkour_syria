<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class BlogPostTranslation extends BaseModel
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'title',
        'excerpt',
        'body',
        'seo_title',
        'seo_description',
    ];
}
