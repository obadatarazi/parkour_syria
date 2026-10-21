<?php

namespace App\Http\QueryFilter;

use Illuminate\Http\Request;

class GalleryImageFilter extends QueryFilter
{
    protected $searchColumns = ['caption'];

    public function __construct(Request $request)
    {
        $this->validationArray = [
            'search' => 'string|nullable',
            'publish' => 'boolean',
        ];

        parent::__construct($request);
    }
}
