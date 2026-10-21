<?php

namespace App\Services;

use App\Models\BlogPost;
use App\Services\Concerns\GeneratesSlugs;
use Illuminate\Database\Eloquent\Model;

class BlogPostService extends BaseService
{
    use GeneratesSlugs;

    const UPLOAD_FOLDER = 'blog-posts';

    public function __construct(UploadFileService $uploadFileService)
    {
        $this->model = BlogPost::class;
        $this->keyFileMaps = ['image_file_url' => 'image'];
        // The resources read these on every row, they would otherwise be a query each.
        $this->withRelations = ['translations', 'category.translations'];
        $this->uploadFileService = $uploadFileService;
        parent::__construct();
    }

    public function create($data): BlogPost
    {
        return parent::create($this->withSlug($data, null, 'title'))->refresh()->load($this->withRelations);
    }

    public function update($data, Model $object): BlogPost
    {
        return parent::update($this->withSlug($data, $object, 'title'), $object)->load($this->withRelations);
    }
}
