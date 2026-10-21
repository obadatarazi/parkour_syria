<?php

namespace App\Http\QueryFilter;

use Illuminate\Http\Request;

class SliderFilter extends QueryFilter
{
    protected $searchColumns = ['badge', 'title'];

    public function __construct(Request $request)
    {
        $this->validationArray = [
            'search' => 'string|nullable',
            'publish' => 'boolean',
        ];

        parent::__construct($request);
    }
}
