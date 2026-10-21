<?php

namespace App\Http\Traits;

use App\Http\QueryFilter\QueryFilter;
use Illuminate\Database\Eloquent\Builder;

trait Filterable
{
    /**
     * @return Builder|mixed|void
     */
    public function scopeFilter($query, QueryFilter $filter)
    {
        $query = $filter->applyFilter($query, $this->filterable);
        $query = $filter->applySort($query, $this->sorterable);

        // A listing nobody asked to sort comes back in the model's own order (`$defaultSort`, e.g.
        // lessons by sort_order) instead of whatever order the database happens to return.
        if (empty($filter->getSortField()) && ! empty($this->defaultSort)) {
            foreach ($this->defaultSort as $column => $direction) {
                $query->orderBy($this->qualifyColumn($column), $direction);
            }
        }

        return $query;
    }
}
