<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class DirectoryEntryTranslation extends BaseModel
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'name',
        'description',
    ];
}
