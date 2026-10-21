<?php

namespace App\Services;

use App\Models\Lesson;
use App\Services\Concerns\GeneratesSlugs;
use Illuminate\Database\Eloquent\Model;

class LessonService extends BaseService
{
    use GeneratesSlugs;

    const UPLOAD_FOLDER = 'lessons';

    public function __construct(UploadFileService $uploadFileService)
    {
        $this->model = Lesson::class;
        $this->keyFileMaps = ['image_file_url' => 'image'];
        // The resources read these on every row, they would otherwise be a query each.
        $this->withRelations = ['translations'];
        $this->uploadFileService = $uploadFileService;
        parent::__construct();
    }

    public function create($data): Lesson
    {
        return parent::create($this->withSlug($data, null, 'title'))->refresh()->load($this->withRelations);
    }

    public function update($data, Model $object): Lesson
    {
        return parent::update($this->withSlug($data, $object, 'title'), $object)->load($this->withRelations);
    }
}
