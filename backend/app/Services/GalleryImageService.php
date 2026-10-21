<?php

namespace App\Services;

use App\Models\GalleryImage;
use Illuminate\Database\Eloquent\Model;

class GalleryImageService extends BaseService
{
    const UPLOAD_FOLDER = 'gallery-images';

    public function __construct(UploadFileService $uploadFileService)
    {
        $this->model = GalleryImage::class;
        $this->keyFileMaps = ['image_file_url' => 'image'];
        // The resources read these on every row, they would otherwise be a query each.
        $this->withRelations = ['translations'];
        $this->uploadFileService = $uploadFileService;
        parent::__construct();
    }

    public function create($data): GalleryImage
    {
        return parent::create($data)->refresh()->load($this->withRelations);
    }

    public function update($data, Model $object): GalleryImage
    {
        return parent::update($data, $object)->load($this->withRelations);
    }
}
