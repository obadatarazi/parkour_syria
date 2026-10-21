<?php

namespace App\Services;

use App\Models\Event;
use App\Services\Concerns\GeneratesSlugs;
use Illuminate\Database\Eloquent\Model;

class EventService extends BaseService
{
    use GeneratesSlugs;

    const UPLOAD_FOLDER = 'events';

    public function __construct(UploadFileService $uploadFileService)
    {
        $this->model = Event::class;
        $this->keyFileMaps = ['image_file_url' => 'image'];
        // The resources read these on every row, they would otherwise be a query each.
        $this->withRelations = ['translations', 'area.translations'];
        $this->uploadFileService = $uploadFileService;
        parent::__construct();
    }

    public function create($data): Event
    {
        return parent::create($this->withSlug($data, null, 'title'))->refresh()->load($this->withRelations);
    }

    public function update($data, Model $object): Event
    {
        return parent::update($this->withSlug($data, $object, 'title'), $object)->load($this->withRelations);
    }
}
