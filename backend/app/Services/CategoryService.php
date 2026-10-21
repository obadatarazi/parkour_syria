<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Database\Eloquent\Model;

class CategoryService extends BaseService
{
    const UPLOAD_FOLDER = 'categories';

    public function __construct(UploadFileService $uploadFileService)
    {
        $this->model = Category::class;
        $this->keyFileMaps = ['image_file_url' => 'image'];
        $this->withRelations = ['translations', 'parent.translations'];
        $this->uploadFileService = $uploadFileService;
        parent::__construct();
    }

    public function create($data): Category
    {
        $category = parent::create($this->withTranslatedSlugs($data));

        return $category->load($this->withRelations);
    }

    public function update($data, Model $object): Category
    {
        $category = parent::update($this->withTranslatedSlugs($data), $object);

        return $category->load($this->withRelations);
    }

    /**
     * A category still carrying products is not deleted, the admin moves them first.
     */
    public function delete(Model $object): void
    {
        $count = $object->products()->count();

        abort_if($count > 0, 422, __('exceptions.category_has_products', [
            'name' => $object->title,
            'count' => $count,
        ]));

        parent::delete($object);
    }

    public function findBySlug($slug): Category
    {
        return Category::whereTranslation('slug', $slug)->where('publish', true)->firstOrFail();
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function withTranslatedSlugs(array $data): array
    {
        foreach (['ar', 'en'] as $locale) {
            if (isset($data[$locale]['title'])) {
                $data[$locale]['slug'] = preg_replace('/[^\p{L}\p{N}]+/u', '-', mb_strtolower(trim($data[$locale]['title'])));
            }
        }

        return $data;
    }
}
