<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class LessonTranslation extends BaseModel
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'title',
        'summary',
        'body',
        'safety_note',
    ];
}
