<?php

namespace App\Models;

use App\Http\Docs\Schemas\TagSchema;
use App\Http\Traits\Filterable;
use Astrotomic\Translatable\Contracts\Translatable as TranslatableContract;
use Astrotomic\Translatable\Translatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

#[TagSchema]
class Tag extends BaseModel implements TranslatableContract
{
    use Filterable, HasFactory, Translatable;

    protected $fillable = ['publish'];

    public $translatedAttributes = ['title', 'slug'];

    protected $casts = [
        'created_at' => 'datetime:Y-m-d H:i:s',
        'updated_at' => 'datetime:Y-m-d H:i:s',
    ];

    protected $sorterable = ['id', 'title', 'created_at'];

    protected $filterable = [
        'publish' => '=',
        'title' => 'like',
        'slug' => 'like',
    ];
}
