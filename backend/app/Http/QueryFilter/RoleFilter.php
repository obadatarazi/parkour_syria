<?php


namespace App\Http\QueryFilter;

use Illuminate\Http\Request;

class RoleFilter extends QueryFilter
{
    protected $searchColumns = ['name'];
    public function __construct(Request $request)
    {
        $this->validationArray = [
            'search' => 'string|nullable',
            'code' => 'string'
        ];
        parent::__construct($request);
    }
}
