<?php

namespace App\Models;

use App\Http\Docs\Schemas\CategorySchema;
use App\Http\Traits\Filterable;
use Astrotomic\Translatable\Contracts\Translatable as TranslatableContract;
use Astrotomic\Translatable\Translatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Dormant shop taxonomy (FEATURE_ECOMMERCE). One optional parent per category.
 */
#[CategorySchema]
class Category extends BaseModel implements TranslatableContract
{
    use HasFactory, Filterable, Translatable;

    protected $fillable = [
        'parent_category_id',
        'publish',
        'image_file_url',
    ];

    public $translatedAttributes = ['title', 'description', 'slug'];

    protected $casts = [
        'publish' => 'boolean',
        'created_at' => 'datetime:Y-m-d H:i:s',
        'updated_at' => 'datetime:Y-m-d H:i:s'
    ];

    protected $sorterable = ['id', 'title', 'created_at'];

    protected $filterable = [
        'publish' => '=',
        'parent_category_id' => '=',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_category_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_category_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'category_id');
    }
}
