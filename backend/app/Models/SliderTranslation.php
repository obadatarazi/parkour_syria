<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class SliderTranslation extends BaseModel
{
    use HasFactory;

    public $timestamps = false;
    protected $fillable = [
        'badge',
        'title',
        'description',
        'primary_button_text',
        'secondary_button_text',
    ];
}
