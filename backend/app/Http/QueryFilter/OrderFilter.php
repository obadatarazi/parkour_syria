<?php

namespace App\Http\QueryFilter;

use Illuminate\Http\Request;

class OrderFilter extends QueryFilter
{
    protected $searchColumns = ['order_ref_number', 'customer_name', 'customer_phone'];

    public function __construct(Request $request)
    {
        $this->validationArray = [
            'search' => 'string|nullable',
            'status' => 'string|in:PENDING,CONFIRMED,SHIPPED,COMPLETED,CANCELLED',
        ];

        parent::__construct($request);
    }
}
