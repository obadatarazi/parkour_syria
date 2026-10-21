<?php

namespace App\Http\QueryFilter;

use Illuminate\Http\Request;

class EventFilter extends QueryFilter
{
    protected $searchColumns = ['title', 'location_label'];

    public function __construct(Request $request)
    {
        $this->validationArray = [
            'search' => 'string|nullable',
            'publish' => 'boolean',
            'type' => 'string|in:workshop,gathering',
            'areaId' => 'integer',
            'area' => 'string',
            'upcoming' => 'boolean',
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

    /**
     * Only what has not started yet. The public listing always applies it.
     */
    public function upcoming($value)
    {
        if ($value) {
            $this->query->where('starts_at', '>=', now());
        }

        return $this->query;
    }

    public function areaId($value)
    {
        return $this->query->where('area_id', (int) $value);
    }
}
