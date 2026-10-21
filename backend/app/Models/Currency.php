<?php

namespace App\Models;

use App\Http\Docs\Schemas\CurrencySchema;
use App\Http\Traits\Filterable;
use Astrotomic\Translatable\Contracts\Translatable as TranslatableContract;
use Astrotomic\Translatable\Translatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

#[CurrencySchema]
class Currency extends BaseModel implements TranslatableContract
{
    use HasFactory, Translatable, Filterable;

    protected $fillable = ['symbol', 'code', 'publish', 'is_default'];
    public $translatedAttributes = ['title'];

    protected $casts = [
        'publish' => 'boolean',
        'is_default' => 'boolean',
        'created_at' => 'datetime:Y-m-d H:i:s',
        'updated_at' => 'datetime:Y-m-d H:i:s'
    ];

    protected $filterable = [
        'title' => 'like',
        'code' => '=',
        'publish' => '=',
        'is_default' => '='
    ];

    protected $sorterable = ['id', 'title', 'code', 'created_at'];
}
