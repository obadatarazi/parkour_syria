<?php

namespace App\Services;

use App\Models\BlogPost;
use App\Services\Concerns\GeneratesSlugs;
use Illuminate\Database\Eloquent\Collection;
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

    /**
     * Other published posts for the bottom of an article (scope part 8): the same category first,
     * newest first, topped up with the latest posts when the category has too few.
     *
     * @return Collection<int, BlogPost>
     */
    public function related(BlogPost $post, int $limit = 3): Collection
    {
        $base = fn () => BlogPost::query()->with($this->withRelations)
            ->where('publish', true)
            ->whereKeyNot($post->getKey())
            ->orderByDesc('published_at')
            ->orderByDesc('id');

        $related = $post->blog_category_id
            ? $base()->where('blog_category_id', $post->blog_category_id)->limit($limit)->get()
            : new Collection();

        if ($related->count() < $limit) {
            $related = $related->concat(
                $base()->whereKeyNot($related->modelKeys())->limit($limit - $related->count())->get()
            );
        }

        return $related->values();
    }

    public function update($data, Model $object): BlogPost
    {
        return parent::update($this->withSlug($data, $object, 'title'), $object)->load($this->withRelations);
    }
}
