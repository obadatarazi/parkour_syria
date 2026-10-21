<?php

namespace App\Http\QueryFilter;

use Illuminate\Http\Request;

class CategoryFilter extends QueryFilter
{
    protected $searchColumns = ['title', 'slug'];

    public function __construct(Request $request)
    {
        $this->validationArray = [
            'search' => 'string|nullable',
            'publish' => 'boolean',
            'parentCategoryId' => 'integer',
            'rootOnly' => 'boolean',
        ];

        parent::__construct($request);
    }

    public function rootOnly($value): void
    {
        if (filter_var($value, FILTER_VALIDATE_BOOLEAN)) {
            $this->query->whereNull('parent_category_id');
        }
    }
}
