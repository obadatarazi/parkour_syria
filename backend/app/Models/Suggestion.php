<?php

namespace App\Models;

use App\Http\Docs\Schemas\SuggestionSchema;
use App\Http\Traits\Filterable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A place, coach, team or event proposed from the website. Never shown publicly: an admin accepts
 * it into a directory entry / event, or rejects it with a reason.
 */
#[SuggestionSchema]
class Suggestion extends BaseModel
{
    use Filterable, HasFactory;

    protected $fillable = [
        'type',
        'name',
        'area_id',
        'description',
        'contact',
        'starts_at',
        'proposer_name',
        'proposer_contact',
        'payload',
        'safety_accepted',
        'ip_address',
    ];

    protected $hidden = ['ip_address'];

    protected $casts = [
        'payload' => 'array',
        'safety_accepted' => 'boolean',
        'starts_at' => 'datetime:Y-m-d H:i:s',
        'reviewed_at' => 'datetime:Y-m-d H:i:s',
        'created_at' => 'datetime:Y-m-d H:i:s',
        'updated_at' => 'datetime:Y-m-d H:i:s',
    ];

    protected $filterable = [
        'type' => '=',
        'status' => '=',
    ];

    protected $sorterable = ['id', 'status', 'created_at'];

    protected $defaultSort = ['id' => 'desc'];

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class, 'area_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
