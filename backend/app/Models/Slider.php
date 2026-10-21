<?php

namespace App\Models;

use App\Http\Docs\Schemas\SliderSchema;
use App\Http\Traits\Filterable;
use Astrotomic\Translatable\Contracts\Translatable as TranslatableContract;
use Astrotomic\Translatable\Translatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * A hero slide of the home page.
 */
#[SliderSchema]
class Slider extends BaseModel implements TranslatableContract
{
    use Filterable, HasFactory, Translatable;

    protected $fillable = [
        'sort_order',
        'publish',
        'primary_page',
        'secondary_page',
        'image_file_url',
    ];

    public $translatedAttributes = [
        'badge',
        'title',
        'description',
        'primary_button_text',
        'secondary_button_text',
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
