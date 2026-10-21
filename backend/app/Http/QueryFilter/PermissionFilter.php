<?php


namespace App\Http\QueryFilter;

use Illuminate\Http\Request;

class PermissionFilter extends QueryFilter
{
    protected $searchColumns = ['name'];
    public function __construct(Request $request)
    {
        $this->validationArray = [
            'search' => 'string|nullable',
        ];
        parent::__construct($request);
    }
}
