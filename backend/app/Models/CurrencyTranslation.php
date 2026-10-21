<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class CurrencyTranslation extends BaseModel
{
    use HasFactory;

    public $timestamps = false;
    protected $fillable = ['title'];
}
