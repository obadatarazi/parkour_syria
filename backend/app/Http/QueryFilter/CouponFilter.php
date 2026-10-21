<?php

namespace App\Http\QueryFilter;

use Illuminate\Http\Request;

class CouponFilter extends QueryFilter
{
    protected $searchColumns = ['code'];

    public function __construct(Request $request)
    {
        $this->validationArray = [
            'search' => 'string|nullable',
            'type' => 'string|in:PERCENTAGE,FIXED',
            'publish' => 'boolean',
        ];

        parent::__construct($request);
    }
}
