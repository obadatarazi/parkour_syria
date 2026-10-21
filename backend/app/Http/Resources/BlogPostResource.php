<?php

namespace App\Http\Resources;

use App\Constant\SerializedGroup;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Dashboard shape: every column plus the translations of each locale.
 */
class BlogPostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $serializedGroup = $request->get('serializedGroup');
        $isDetails = $serializedGroup === SerializedGroup::Details->value;
        $isListOrDetails = $isDetails || $serializedGroup === SerializedGroup::List->value;

        return [
            'id' => $this->when($isListOrDetails, $this->id),
            'slug' => $this->when($isListOrDetails, $this->slug),
            'blogCategoryId' => $this->when($isListOrDetails, $this->blog_category_id),
            'publish' => $this->when($isListOrDetails, (bool) $this->publish),
            'publishedAt' => $this->when($isListOrDetails, $this->published_at),
            'title' => $this->when($isListOrDetails, $this->title),
            'excerpt' => $this->when($isListOrDetails, $this->excerpt),
            'body' => $this->when($isDetails, $this->body),
            'seoTitle' => $this->when($isListOrDetails, $this->seo_title),
            'seoDescription' => $this->when($isListOrDetails, $this->seo_description),
            'imageFileUrl' => $this->when($isListOrDetails, $this->image_file_url),
            'category' => $this->when($isListOrDetails, $this->category ? [
                'id' => $this->category->id,
                'slug' => $this->category->slug,
                'title' => $this->category->title,
            ] : null),
            'translations' => $this->when($isListOrDetails, $this->customTranslations),
            'createdAt' => $this->when($isListOrDetails, $this->created_at),
            'updatedAt' => $this->when($isListOrDetails, $this->updated_at),
        ];
    }
}
