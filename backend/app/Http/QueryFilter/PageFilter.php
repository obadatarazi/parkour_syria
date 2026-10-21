<?php

namespace App\Http\QueryFilter;

use Illuminate\Http\Request;

class PageFilter extends QueryFilter
{
    protected $searchColumns = ['title', 'key'];

    public function __construct(Request $request)
    {
        $this->validationArray = [
            'search' => 'string|nullable',
            'publish' => 'boolean',
            'key' => 'string',
        ];

        parent::__construct($request);
    }
}
