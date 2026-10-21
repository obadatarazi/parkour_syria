<?php

namespace App\Models;

use App\Http\Docs\Schemas\ProductSchema;
use App\Http\Traits\Filterable;
use Astrotomic\Translatable\Contracts\Translatable as TranslatableContract;
use Astrotomic\Translatable\Translatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Dormant shop product (FEATURE_ECOMMERCE). The parkour book is the first candidate.
 */
#[ProductSchema]
class Product extends BaseModel implements TranslatableContract
{
    use HasFactory, Filterable, Translatable, SoftDeletes;

    protected $fillable = [
        'slug',
        'sku_code',
        'brand_id',
        'category_id',
        'price',
        'stock',
        'publish',
        'image_file_url',
    ];

    public $translatedAttributes = [
        'title',
        'description',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
        'publish' => 'boolean',
        'created_at' => 'datetime:Y-m-d H:i:s',
        'updated_at' => 'datetime:Y-m-d H:i:s',
    ];

    protected $sorterable = [
        'id',
        'price',
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
    protected $defaultSort = ['id' => 'desc'];

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class, 'brand_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'product_tag');
    }
}
