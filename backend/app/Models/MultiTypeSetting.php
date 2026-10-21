<?php

namespace App\Models;

use App\Http\Docs\Schemas\MultiTypeSettingSchema;
use App\Http\Traits\Filterable;
use App\Services\MultiTypeSettingService;
use Illuminate\Database\Eloquent\Factories\HasFactory;

#[MultiTypeSettingSchema]
class MultiTypeSetting extends BaseModel
{
    use HasFactory, Filterable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = ['setting_key', 'value', 'type', 'description'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected $casts = ['created_at' => 'datetime:Y-m-d H:i:s'];

    protected $filterable = [
        'setting_key' => 'like',
        'type' => '='
    ];

    protected $sorterable = ['id', 'setting_key', 'type', 'created_at'];

    protected $appends = ['type_value'];

    /**
     * Settings are cached across requests. A write during this request must drop that cache and the
     * per-request memos so the value the admin just saved is what every later read sees.
     */
    protected static function booted(): void
    {
        static::saved(function () {
            MultiTypeSettingService::flushCache();
        });
        static::deleted(function () {
            MultiTypeSettingService::flushCache();
        });
    }

    public function getTypeValueAttribute()
    {
        return match ($this->attributes['type']) {
            'EMAIL' => __('enum.EMAIL'),
            'LINK' => __('enum.LINK'),
            'NUMBER' => __('enum.NUMBER'),
            'PHONE_NUMBER' => __('enum.PHONE_NUMBER'),
            'TEXT' => __('enum.TEXT'),
            'PERCENTAGE' => __('enum.PERCENTAGE'),
            'BOOLEAN' => __('enum.BOOLEAN'),
            default => $this->attributes['type'],
        };
    }

    public function getCustomTypeAttribute(): array
    {
        return [
            'label' => $this->getTypeValueAttribute(),
            'value' => $this->attributes['type'],
        ];
    }
}
