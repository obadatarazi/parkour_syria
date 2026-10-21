<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class EventTranslation extends BaseModel
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'title',
        'location_label',
        'description',
    ];
}
