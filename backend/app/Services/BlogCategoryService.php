<?php

namespace App\Services;

use App\Models\BlogCategory;
use App\Services\Concerns\GeneratesSlugs;
use Illuminate\Database\Eloquent\Model;

class BlogCategoryService extends BaseService
{
    use GeneratesSlugs;

    const UPLOAD_FOLDER = 'blog-categories';

    public function __construct()
    {
        $this->model = BlogCategory::class;
        // The resources read these on every row, they would otherwise be a query each.
        $this->withRelations = ['translations'];
        parent::__construct();
    }

    public function create($data): BlogCategory
    {
        return parent::create($this->withSlug($data, null, 'title'))->refresh()->load($this->withRelations);
    }

    public function update($data, Model $object): BlogCategory
    {
        return parent::update($this->withSlug($data, $object, 'title'), $object)->load($this->withRelations);
    }
}
