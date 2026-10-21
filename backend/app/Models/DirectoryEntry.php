<?php

namespace App\Models;

use App\Http\Docs\Schemas\DirectoryEntrySchema;
use App\Http\Traits\Filterable;
use Astrotomic\Translatable\Contracts\Translatable as TranslatableContract;
use Astrotomic\Translatable\Translatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A place, coach or team of the directory.
 */
#[DirectoryEntrySchema]
class DirectoryEntry extends BaseModel implements TranslatableContract
{
    use HasFactory, Filterable, Translatable;

    protected $fillable = [
        'slug',
        'type',
        'area_id',
        'whatsapp',
        'facebook_url',
        'instagram_url',
        'map_url',
        'verified',
        'publish',
        'sort_order',
        'image_file_url',
    ];

    public $translatedAttributes = [
        'name',
        'description',
    ];

    protected $casts = [
        'verified' => 'boolean',
        'publish' => 'boolean',
        'sort_order' => 'integer',
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
        'verified' => '=',
        'type' => '=',
        'area_id' => '=',
    ];

    /**
     * The order a listing comes back in when the caller did not ask for one.
     *
     * @var array<string, string>
     */
    protected $defaultSort = ['sort_order' => 'asc', 'id' => 'desc'];

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class, 'area_id');
    }
}
