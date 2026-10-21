<?php

namespace App\Models;

use App\Http\Docs\Schemas\BrandSchema;
use App\Http\Traits\Filterable;
use Astrotomic\Translatable\Contracts\Translatable as TranslatableContract;
use Astrotomic\Translatable\Translatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\DB;

#[BrandSchema]
class Brand extends BaseModel implements TranslatableContract
{
    use Filterable, HasFactory, Translatable;

    protected $fillable = [
        'publish',
        'logo_file_url',
    ];

    public $translatedAttributes = ['title', 'description', 'slug'];

    protected $casts = [
        'created_at' => 'datetime:Y-m-d H:i:s',
        'updated_at' => 'datetime:Y-m-d H:i:s',
    ];

    protected $sorterable = ['id', 'title', 'created_at'];

    protected $filterable = [
        'publish' => '=',
        'title' => 'like',
        'slug' => 'like',
    ];

    /**
     * Lightweight label/value list for option dropdowns. Title follows X-Locale.
     *
     * @return array<int, array{label: string, value: string}>
     */
    public static function getOptions($translator, bool $withProductsOnly = false): array
    {
        $query = static::query()
            ->join('brand_translations', 'brands.id', '=', 'brand_translations.brand_id')
            ->where('brand_translations.locale', $translator);

        if ($withProductsOnly) {
            $query->whereExists(function ($subQuery) {
                $subQuery->select(DB::raw(1))
                    ->from('products')
                    ->whereColumn('products.brand_id', 'brands.id');
            });
        }

        return $query
            ->orderBy('brand_translations.title')
            ->toBase()
            ->get(['brands.id', 'brand_translations.title as title'])
            ->map(static fn ($brand) => [
                'label' => (string) $brand->title,
                'value' => (string) $brand->id,
            ])
            ->values()
            ->all();
    }
}
