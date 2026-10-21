<?php

namespace App\Http\QueryFilter;

use Illuminate\Http\Request;

class SuggestionFilter extends QueryFilter
{
    protected $searchColumns = ['name', 'description', 'proposer_name'];

    public function __construct(Request $request)
    {
        $this->validationArray = [
            'search' => 'string|nullable',
            'type' => 'string|in:place,coach,team,event',
            'status' => 'string|in:pending,accepted,rejected',
            'areaId' => 'integer',
        ];

        parent::__construct($request);
    }

    public function areaId($value)
    {
        return $this->query->where('area_id', (int) $value);
    }
}
