<?php

namespace App\Services;

use App\Models\Slider;
use Illuminate\Database\Eloquent\Model;

class SliderService extends BaseService
{
    const UPLOAD_FOLDER = 'sliders';

    public function __construct(UploadFileService $uploadFileService)
    {
        $this->model = Slider::class;
        $this->keyFileMaps = ['image_file_url' => 'image'];
        // The resources read these on every row, they would otherwise be a query each.
        $this->withRelations = ['translations'];
        $this->uploadFileService = $uploadFileService;
        parent::__construct();
    }

    public function create($data): Slider
    {
        return parent::create($data)->refresh()->load($this->withRelations);
    }

    public function update($data, Model $object): Slider
    {
        return parent::update($data, $object)->load($this->withRelations);
    }
}
