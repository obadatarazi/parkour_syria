<?php

namespace App\Models;

use App\Http\Docs\Schemas\LessonSchema;
use App\Http\Traits\Filterable;
use Astrotomic\Translatable\Contracts\Translatable as TranslatableContract;
use Astrotomic\Translatable\Translatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * A lesson of the beginner path, read in sort_order.
 */
#[LessonSchema]
class Lesson extends BaseModel implements TranslatableContract
{
    use Filterable, HasFactory, Translatable;

    protected $fillable = [
        'slug',
        'sort_order',
        'youtube_url',
        'publish',
        'image_file_url',
    ];

    public $translatedAttributes = [
        'title',
        'summary',
        'body',
        'safety_note',
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
