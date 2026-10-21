<?php

namespace App\Http\QueryFilter;

use Illuminate\Http\Request;

class AreaFilter extends QueryFilter
{
    protected $searchColumns = ['name', 'slug'];

    public function __construct(Request $request)
    {
        $this->validationArray = [
            'search' => 'string|nullable',
            'publish' => 'boolean',
        ];

        parent::__construct($request);
    }
}
