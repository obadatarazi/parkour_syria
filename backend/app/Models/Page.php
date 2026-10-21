<?php

namespace App\Models;

use App\Http\Docs\Schemas\PageSchema;
use App\Http\Traits\Filterable;
use Astrotomic\Translatable\Contracts\Translatable as TranslatableContract;
use Astrotomic\Translatable\Translatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * A fixed page of the site (home, what, about, contact, disclaimer, book), found by its key.
 */
#[PageSchema]
class Page extends BaseModel implements TranslatableContract
{
    use Filterable, HasFactory, Translatable;

    protected $fillable = [
        'key',
        'publish',
        'image_file_url',
    ];

    public $translatedAttributes = [
        'title',
        'body',
        'seo_title',
        'seo_description',
    ];

    protected $casts = [
        'publish' => 'boolean',
        'created_at' => 'datetime:Y-m-d H:i:s',
        'updated_at' => 'datetime:Y-m-d H:i:s',
    ];

    protected $sorterable = [
        'id',
        'key',
        'created_at',
    ];

    protected $filterable = [
        'publish' => '=',
        'key' => '=',
    ];

    /**
     * The order a listing comes back in when the caller did not ask for one.
     *
     * @var array<string, string>
     */
    protected $defaultSort = ['id' => 'asc'];
}
