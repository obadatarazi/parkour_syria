<?php

namespace App\Services;

use App\Models\Area;
use App\Services\Concerns\GeneratesSlugs;
use Illuminate\Database\Eloquent\Model;

class AreaService extends BaseService
{
    use GeneratesSlugs;

    const UPLOAD_FOLDER = 'areas';

    public function __construct()
    {
        $this->model = Area::class;
        // The resources read these on every row, they would otherwise be a query each.
        $this->withRelations = ['translations'];
        parent::__construct();
    }

    public function create($data): Area
    {
        return parent::create($this->withSlug($data, null, 'name'))->refresh()->load($this->withRelations);
    }

    public function update($data, Model $object): Area
    {
        return parent::update($this->withSlug($data, $object, 'name'), $object)->load($this->withRelations);
    }
}
