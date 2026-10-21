<?php

namespace App\Http\QueryFilter;

use Illuminate\Http\Request;

class UserFilter extends QueryFilter
{
    protected $searchColumns = ['full_name'];

    public function __construct(Request $request)
    {
        $this->validationArray = [
            'search' => 'string|nullable',
            'email' => 'string',
            'gender' => 'string',
            'type' => 'string',
            'role' => 'integer',
            'active' => 'boolean',
        ];

        parent::__construct($request);
    }

    public function email($value)
    {
        return $this->query->where('email', 'like', '%'.$value.'%');
    }

    public function role($value)
    {
        return $this->query->whereHas('roles', function ($query) use ($value) {
            $query->where('id', '=', $value);
        });
    }
}
