<?php

namespace App\Http\QueryFilter;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class QueryFilter
{
    protected $request;

    protected $query;

    protected array $validationArray = [];

    protected $searchColumns = [];

    /**
     * QueryFilter contractor.
     * @param Request $request
     */
    public function __construct(Request $request)
    {
        $this->request = $request;

        foreach ($this->validationArray as $key => $value) {
            if ($request->has($key) && $value === 'boolean') {
                $publishValue = filter_var($request->input($key), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                $request->merge([$key => $publishValue]);
            }
        }

        if ($this->validationArray) {
            Validator::validate($request->all(), array_merge($this->validationArray, ['sorts' => 'array']));
        }

    }

    /**
     * @param Builder $query
     * @param array $filterable
     * @return mixed
     */
    public function applyFilter(Builder $query, $filterable = []): mixed
    {
        $this->query = $query;

        foreach ($this->getFiltersFields() as $name => $value) {
            $snakeName = Str::snake($name);

            if (method_exists($this, $name) && $value !== '') {
                call_user_func_array([$this, $name], [$value]);
            } elseif (isset($filterable[$snakeName])) {
                $this->query->where($snakeName, $filterable[$snakeName], $value);
            }
        }
        return $this->query;
    }

    public function applySort(Builder $query, $sorterable = []): mixed
    {
        $this->query = $query;

        $sort = $this->getSortField();
        $direction = $this->getSortDirection();

        if (!empty($sort)) {
            if (in_array($sort, $sorterable)) {
                $this->query->orderBy($sort, $direction);
            }
        }

        return $this->query;
    }

    public function getFiltersFields(): array
    {
        return $this->request->all();
    }

    public function getSortField()
    {
        return $this->request->get('sort', '');
    }

    public function setFilter($filter, $value)
    {
        return $this->request[$filter] = $value;
    }

    public function getSortDirection()
    {
        return $this->request->get('direction', 'asc');
    }

    /**
     * Token LIKE search over `$searchColumns`, translated or not. Every word of the term has to
     * appear in at least one of the columns.
     *
     * MATCH..AGAINST was dropped here: with InnoDB's default token size it misses short words and
     * a lot of Arabic, and the site is Arabic first. The tables are small enough for LIKE.
     */
    public function search($search)
    {
        $term = trim((string) $search);

        if (empty($this->searchColumns) || $term === '') {
            return $this->query;
        }

        $model = $this->query->getModel();
        $translated = is_array($model->translatedAttributes ?? null) ? $model->translatedAttributes : [];
        $tokens = preg_split('/\s+/u', $term) ?: [];

        foreach ($tokens as $token) {
            $like = '%' . addcslashes($token, '%_\\') . '%';

            $this->query->where(function ($query) use ($like, $translated) {
                foreach ($this->searchColumns as $column) {
                    if (in_array($column, $translated, true)) {
                        $query->orWhereHas('translations', fn ($q) => $q->where($column, 'LIKE', $like));
                    } else {
                        $query->orWhere($query->getModel()->qualifyColumn($column), 'LIKE', $like);
                    }
                }
            });
        }

        return $this->query;
    }
}
