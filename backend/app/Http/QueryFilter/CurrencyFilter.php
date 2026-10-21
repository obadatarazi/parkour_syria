<?php

namespace App\Http\QueryFilter;

use Illuminate\Http\Request;

class CurrencyFilter extends QueryFilter
{
    protected $searchColumns = ['title'];

    public function __construct(Request $request)
    {
        $this->validationArray = [
            'search' => 'string|nullable',
            'code' => 'string',
            'publish' => 'boolean',
            'isDefault' => 'boolean',
        ];

        parent::__construct($request);
    }
}
