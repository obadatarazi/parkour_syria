<?php

namespace App\Models;

use App\Http\Docs\Schemas\AreaSchema;
use App\Http\Traits\Filterable;
use App\Models\Concerns\HasTranslatedOptions;
use Astrotomic\Translatable\Contracts\Translatable as TranslatableContract;
use Astrotomic\Translatable\Translatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * A neighbourhood the directory and events are filed under.
 */
#[AreaSchema]
class Area extends BaseModel implements TranslatableContract
{
    use Filterable, HasFactory, HasTranslatedOptions, Translatable;

    protected string $optionLabel = 'name';

    protected $fillable = [
        'slug',
        'sort_order',
        'publish',
    ];

    public $translatedAttributes = [
        'name',
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
