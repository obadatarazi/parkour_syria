<?php

namespace App\Models;

use App\Http\Docs\Schemas\GalleryImageSchema;
use App\Http\Traits\Filterable;
use Astrotomic\Translatable\Contracts\Translatable as TranslatableContract;
use Astrotomic\Translatable\Translatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * A photo of the home page gallery.
 */
#[GalleryImageSchema]
class GalleryImage extends BaseModel implements TranslatableContract
{
    use HasFactory, Filterable, Translatable;

    protected $fillable = [
        'sort_order',
        'publish',
        'image_file_url',
    ];

    public $translatedAttributes = [
        'caption',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'publish' => 'boolean',
        'created_at' => 'datetime:Y-m-d H:i:s',
        'updated_at' => 'datetime:Y-m-d H:i:s',
    ];

    protected $sorterable = [
        'id',
        'sort_order',
        'created_at',
    ];

    protected $filterable = [
        'publish' => '=',
    ];

    /**
     * The order a listing comes back in when the caller did not ask for one.
     *
     * @var array<string, string>
     */
    protected $defaultSort = ['sort_order' => 'asc', 'id' => 'asc'];
}
