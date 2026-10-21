<?php

namespace App\Http\QueryFilter;

use Illuminate\Http\Request;

class BlogPostFilter extends QueryFilter
{
    protected $searchColumns = ['title', 'excerpt'];

    public function __construct(Request $request)
    {
        $this->validationArray = [
            'search' => 'string|nullable',
            'publish' => 'boolean',
            'blogCategoryId' => 'integer',
            'category' => 'string',
        ];

        parent::__construct($request);
    }

    /**
     * The website filters by the category's slug, the dashboard by its id.
     */
    public function category($value)
    {
        return $this->query->whereHas('category', fn ($query) => $query->where('slug', $value));
    }

    public function blogCategoryId($value)
    {
        return $this->query->where('blog_category_id', (int) $value);
    }
}
