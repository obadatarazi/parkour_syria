<?php

namespace App\Services;

use App\Models\DirectoryEntry;
use App\Services\Concerns\GeneratesSlugs;
use Illuminate\Database\Eloquent\Model;

class DirectoryEntryService extends BaseService
{
    use GeneratesSlugs;

    const UPLOAD_FOLDER = 'directory-entries';

    public function __construct(UploadFileService $uploadFileService)
    {
        $this->model = DirectoryEntry::class;
        $this->keyFileMaps = ['image_file_url' => 'image'];
        // The resources read these on every row, they would otherwise be a query each.
        $this->withRelations = ['translations', 'area.translations'];
        $this->uploadFileService = $uploadFileService;
        parent::__construct();
    }

    public function create($data): DirectoryEntry
    {
        return parent::create($this->withSlug($data, null, 'name'))->refresh()->load($this->withRelations);
    }

    public function update($data, Model $object): DirectoryEntry
    {
        return parent::update($this->withSlug($data, $object, 'name'), $object)->load($this->withRelations);
    }
}
