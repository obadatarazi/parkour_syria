<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class BlogCategoryTranslation extends BaseModel
{
    use HasFactory;

    public $timestamps = false;
    protected $fillable = [
        'title',
    ];
}
