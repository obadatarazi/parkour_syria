<?php

namespace App\Services;

use App\Models\Tag;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TagService extends BaseService
{
    public function __construct()
    {
        $this->model = Tag::class;
        // The resource reads the translations of every row, they would otherwise be a query each.
        $this->withRelations = ['translations'];
        parent::__construct();
    }

    public function create($data): Tag
    {
        $tag = new Tag();
        $tag->fill($data);

        $translations = $tag->getTranslationsArray();

        foreach (['en', 'ar'] as $locale) {
            if (isset($translations[$locale]['title'])) {
                if ($locale === 'ar') {
                    $tag->translateOrNew($locale)->slug = $this->slugifyArabic($translations[$locale]['title']);
                } else {
                    $tag->translateOrNew($locale)->slug = Str::slug($translations[$locale]['title'], '-');
                }
            }
        }

        $tag->save();

        return $tag;
    }

    public function update($data, Model | Tag $tag): Tag
    {
        $tag->update($data);

        foreach (['en', 'ar'] as $locale) {
            if (isset($data[$locale]['title'])) {
                if ($locale === 'ar') {
                    $tag->translateOrNew($locale)->slug = $this->slugifyArabic($data[$locale]['title']);
                } else {
                    $tag->translateOrNew($locale)->slug = Str::slug($data[$locale]['title'], '-');
                }
            }
        }

        $tag->save();

        return $tag;
    }

    public function findBySlug($slug): Tag
    {
        return Tag::whereTranslation('slug', $slug)->firstOrFail();
    }

    /**
     * A tag still assigned to products is not deleted, the admin takes it off them first.
     */
    public function delete(Model $object): void
    {
        $count = DB::table('product_tag')->where('tag_id', $object->getKey())->count();

        abort_if($count > 0, 422, __('exceptions.tag_has_products', [
            'name' => $object->title,
            'count' => $count,
        ]));

        parent::delete($object);
    }

    private function slugifyArabic($text): array|string|null
    {
        return preg_replace('/\s+/u', '-', trim($text));
    }
}
