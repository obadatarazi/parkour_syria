<?php

namespace App\Services;

use App\Models\Product;
use App\Services\Concerns\GeneratesSlugs;
use Illuminate\Database\Eloquent\Model;

class ProductService extends BaseService
{
    use GeneratesSlugs;

    const UPLOAD_FOLDER = 'products';

    public function __construct(UploadFileService $uploadFileService)
    {
        $this->model = Product::class;
        $this->keyFileMaps = ['image_file_url' => 'image'];
        // The resources read these on every row, they would otherwise be a query each.
        $this->withRelations = ['translations'];
        $this->uploadFileService = $uploadFileService;
        parent::__construct();
    }

    public function create($data): Product
    {
        return parent::create($this->withSlug($data, null, 'title'))->refresh()->load($this->withRelations);
    }

    public function update($data, Model $object): Product
    {
        return parent::update($this->withSlug($data, $object, 'title'), $object)->load($this->withRelations);
    }
}
