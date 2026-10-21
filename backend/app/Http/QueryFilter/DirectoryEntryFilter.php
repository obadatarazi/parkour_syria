<?php

namespace App\Http\QueryFilter;

use Illuminate\Http\Request;

class DirectoryEntryFilter extends QueryFilter
{
    protected $searchColumns = ['name', 'description'];

    public function __construct(Request $request)
    {
        $this->validationArray = [
            'search' => 'string|nullable',
            'publish' => 'boolean',
            'verified' => 'boolean',
            'type' => 'string|in:place,coach,team',
            'areaId' => 'integer',
            'area' => 'string',
        ];

        parent::__construct($request);
    }

    /**
     * The website filters by the area's slug (mazzeh, abu-rummaneh, ...), the dashboard by its id.
     */
    public function area($value)
    {
        return $this->query->whereHas('area', fn ($query) => $query->where('slug', $value));
    }

    public function areaId($value)
    {
        return $this->query->where('area_id', (int) $value);
    }
}
