<?php

namespace App\Http\QueryFilter;

use Illuminate\Http\Request;

class MultiTypeSettingFilter extends QueryFilter
{
    protected $searchColumns = ['setting_key'];
    public function __construct(Request $request)
    {
        $this->validationArray = [
            'search' => 'string|nullable',
            'type' => 'string'
        ];

        parent::__construct($request);
    }
}

