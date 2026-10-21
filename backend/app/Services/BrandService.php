<?php

namespace App\Services;

use App\Models\Brand;
use App\Models\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class BrandService extends BaseService
{
    const UPLOAD_FOLDER = 'brands';
    public function __construct(UploadFileService $uploadFileService)
    {
        $this->model = Brand::class;
        $this->keyFileMaps = ['logo_file_url' => 'logo'];
        // The resource reads the translations of every row, they would otherwise be a query each.
        $this->withRelations = ['translations'];
        $this->uploadFileService = $uploadFileService;
        parent::__construct();
    }

    public function create($data) : Brand
    {
        $brand = new Brand();

        $brand->fill($data);

        $translations = $brand->getTranslationsArray();

        foreach (['en', 'ar'] as $locale) {
            if (isset($translations[$locale]['title'])) {
                if ($locale === 'ar') {
                    $brand->translateOrNew($locale)->slug = $this->slugifyArabic($translations[$locale]['title']);
                } else {
                    $brand->translateOrNew($locale)->slug = Str::slug($translations[$locale]['title'], '-');
                }
            }
        }

        if (isset($data['logo'])) {
            $this->uploadFileService->uploadFiles(
                $data,
                $this->keyFileMaps,
                $brand,
                self::UPLOAD_FOLDER
            );
        }

        $brand->save();

        return $brand;
    }

    public function update($data, Model | Brand $brand) : Brand
    {
        $brand->update($data);

        $locales = ['en', 'ar'];

        foreach ($locales as $locale) {
            if (isset($data[$locale]['title'])) {
                if ($locale === 'ar') {
                    $brand->translateOrNew($locale)->slug = $this->slugifyArabic($data[$locale]['title']);
                } else {
                    $brand->translateOrNew($locale)->slug = Str::slug($data[$locale]['title'], '-');
                }
            }
        }

        if (isset($data['logo'])) {
            $this->uploadFileService->uploadFiles(
                $data,
                $this->keyFileMaps,
                $brand,
                self::UPLOAD_FOLDER
            );
        }

        $brand->save();

        return $brand;
    }

    /**
     * A brand still carrying products is not deleted: products.brand_id cascades, so the delete
     * would take every one of them with it. The admin moves or deletes the products first.
     */
    public function delete(Model $object): void
    {
        $count = Product::query()->where('brand_id', $object->getKey())->count();

        abort_if($count > 0, 422, __('exceptions.brand_has_products', [
            'name' => $object->title,
            'count' => $count,
        ]));

        parent::delete($object);
    }

    private function slugifyArabic($text): array|string|null
    {
        return preg_replace('/\s+/u', '-', trim($text));
    }

    public function findBySlug($slug): Brand
    {
        return Brand::whereTranslation('slug', $slug)->firstOrFail();
    }
}
