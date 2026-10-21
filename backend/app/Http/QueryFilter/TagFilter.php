<?php

namespace App\Http\QueryFilter;

use Illuminate\Http\Request;

class TagFilter extends QueryFilter
{
    protected $searchColumns = ['title', 'slug'];

    public function __construct(Request $request)
    {
        $this->validationArray = [
            'search' => 'string|nullable',
            'publish' => 'boolean',
            'slug' => 'string',
        ];

        parent::__construct($request);
    }

    /**
     * LIKE-based search: tag slug has no FULLTEXT index (only title does),
     * and short/Arabic tokens are unreliable with MATCH..AGAINST.
     */
    public function search($search)
    {
        $term = trim((string) $search);

        if ($term === '') {
            return $this->query;
        }

        $tokens = preg_split('/\s+/u', $term) ?: [];

        $this->query->whereHas('translations', function ($q) use ($tokens) {
            foreach ($tokens as $token) {
                $escaped = addcslashes($token, '%_\\');

                $q->where(function ($qq) use ($escaped) {
                    $qq->where('title', 'LIKE', "%{$escaped}%")
                        ->orWhere('slug', 'LIKE', "%{$escaped}%");
                });
            }
        });

        return $this->query;
    }
}
