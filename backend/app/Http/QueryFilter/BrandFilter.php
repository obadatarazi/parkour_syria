<?php

namespace App\Http\QueryFilter;

use Illuminate\Http\Request;

class BrandFilter extends QueryFilter
{
    protected $searchColumns = ['title', 'slug'];

    public function __construct(Request $request)
    {
        $this->validationArray = [
            'search' => 'string|nullable',
            'publish' => 'boolean',
            'slug' => 'string',
        ];

        parent::__construct($request);
    }
}
