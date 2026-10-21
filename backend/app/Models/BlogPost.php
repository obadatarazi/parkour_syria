<?php

namespace App\Models;

use App\Http\Docs\Schemas\BlogPostSchema;
use App\Http\Traits\Filterable;
use Astrotomic\Translatable\Contracts\Translatable as TranslatableContract;
use Astrotomic\Translatable\Translatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * An article. Unpublished posts are drafts and never reach the website.
 */
#[BlogPostSchema]
class BlogPost extends BaseModel implements TranslatableContract
{
    use Filterable, HasFactory, Translatable;

    protected $fillable = [
        'slug',
        'blog_category_id',
        'publish',
        'published_at',
        'image_file_url',
    ];

    public $translatedAttributes = [
        'title',
        'excerpt',
        'body',
        'author',
        'seo_title',
        'seo_description',
    ];

    protected $casts = [
        'publish' => 'boolean',
        'published_at' => 'datetime:Y-m-d H:i:s',
        'created_at' => 'datetime:Y-m-d H:i:s',
        'updated_at' => 'datetime:Y-m-d H:i:s',
    ];

    protected $sorterable = [
        'id',
        'published_at',
        'created_at',
    ];

    protected $filterable = [
        'publish' => '=',
        'blog_category_id' => '=',
    ];

    /**
     * The order a listing comes back in when the caller did not ask for one.
     *
     * @var array<string, string>
     */
    protected $defaultSort = ['published_at' => 'desc', 'id' => 'desc'];

    public function category(): BelongsTo
    {
        return $this->belongsTo(BlogCategory::class, 'blog_category_id');
    }
}
