<?php

namespace App\Models;

use App\Http\Traits\Filterable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Dormant shop (FEATURE_ECOMMERCE). A thin shell: code, value and validity window.
 */
class Coupon extends BaseModel
{
    use Filterable, HasFactory;

    protected $fillable = ['code', 'type', 'value', 'starts_at', 'ends_at', 'usage_limit', 'publish'];

    protected $casts = [
        'value' => 'decimal:2',
        'publish' => 'boolean',
        'starts_at' => 'datetime:Y-m-d H:i:s',
        'ends_at' => 'datetime:Y-m-d H:i:s',
        'created_at' => 'datetime:Y-m-d H:i:s',
        'updated_at' => 'datetime:Y-m-d H:i:s',
    ];

    protected $filterable = ['type' => '=', 'publish' => '='];

    protected $sorterable = ['id', 'code', 'created_at'];

    protected $defaultSort = ['id' => 'desc'];
}
