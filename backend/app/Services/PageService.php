<?php

namespace App\Services;

use App\Models\Page;
use Illuminate\Database\Eloquent\Model;

class PageService extends BaseService
{
    const UPLOAD_FOLDER = 'pages';

    public function __construct(UploadFileService $uploadFileService)
    {
        $this->model = Page::class;
        $this->keyFileMaps = ['image_file_url' => 'image'];
        // The resources read these on every row, they would otherwise be a query each.
        $this->withRelations = ['translations'];
        $this->uploadFileService = $uploadFileService;
        parent::__construct();
    }

    public function create($data): Page
    {
        return parent::create($data)->refresh()->load($this->withRelations);
    }

    public function update($data, Model $object): Page
    {
        return parent::update($data, $object)->load($this->withRelations);
    }
}
