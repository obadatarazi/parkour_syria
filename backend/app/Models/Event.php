<?php

namespace App\Models;

use App\Http\Docs\Schemas\EventSchema;
use App\Http\Traits\Filterable;
use Astrotomic\Translatable\Contracts\Translatable as TranslatableContract;
use Astrotomic\Translatable\Translatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A workshop or gathering. The website only ever sees the ones that have not started yet.
 */
#[EventSchema]
class Event extends BaseModel implements TranslatableContract
{
    use Filterable, HasFactory, Translatable;

    protected $fillable = [
        'slug',
        'type',
        'starts_at',
        'area_id',
        'contact',
        'publish',
        'image_file_url',
    ];

    public $translatedAttributes = [
        'title',
        'location_label',
        'description',
    ];

    protected $casts = [
        'starts_at' => 'datetime:Y-m-d H:i:s',
        'publish' => 'boolean',
        'created_at' => 'datetime:Y-m-d H:i:s',
        'updated_at' => 'datetime:Y-m-d H:i:s',
    ];

    protected $sorterable = [
        'id',
        'starts_at',
        'created_at',
    ];

    protected $filterable = [
        'publish' => '=',
        'type' => '=',
        'area_id' => '=',
    ];

    /**
     * The order a listing comes back in when the caller did not ask for one.
     *
     * @var array<string, string>
     */
    protected $defaultSort = ['starts_at' => 'asc', 'id' => 'asc'];

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class, 'area_id');
    }
}
