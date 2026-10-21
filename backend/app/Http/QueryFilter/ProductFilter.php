<?php

namespace App\Http\QueryFilter;

use Illuminate\Http\Request;

class ProductFilter extends QueryFilter
{
    protected $searchColumns = ['title', 'slug', 'sku_code'];

    public function __construct(Request $request)
    {
        $this->validationArray = [
            'search' => 'string|nullable',
            'publish' => 'boolean',
            'brandId' => 'integer',
            'categoryId' => 'integer',
        ];

        parent::__construct($request);
    }

    public function brandId($value)
    {
        return $this->query->where('brand_id', (int) $value);
    }

    public function categoryId($value)
    {
        return $this->query->where('category_id', (int) $value);
    }
}
