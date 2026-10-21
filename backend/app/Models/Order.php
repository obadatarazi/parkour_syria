<?php

namespace App\Models;

use App\Http\Traits\Filterable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Dormant shop (FEATURE_ECOMMERCE). Status only, no payment gateway: the book is ordered on WhatsApp.
 */
class Order extends BaseModel
{
    use Filterable, HasFactory;

    protected $fillable = [
        'order_ref_number',
        'user_id',
        'coupon_id',
        'currency_id',
        'status',
        'customer_name',
        'customer_phone',
        'subtotal',
        'discount',
        'total',
        'note',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'created_at' => 'datetime:Y-m-d H:i:s',
        'updated_at' => 'datetime:Y-m-d H:i:s',
    ];

    protected $filterable = ['status' => '=', 'user_id' => '='];

    protected $sorterable = ['id', 'total', 'created_at'];

    protected $defaultSort = ['id' => 'desc'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
