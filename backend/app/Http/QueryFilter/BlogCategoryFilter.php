<?php

namespace App\Http\QueryFilter;

use Illuminate\Http\Request;

class BlogCategoryFilter extends QueryFilter
{
    protected $searchColumns = ['title', 'slug'];

    public function __construct(Request $request)
    {
        $this->validationArray = [
            'search' => 'string|nullable',
            'publish' => 'boolean',
        ];

        parent::__construct($request);
    }
}
