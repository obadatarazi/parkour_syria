<?php

namespace App\Http\Resources\Website;

use App\Constant\SerializedGroup;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Website shape: the request locale only, no translations block. Long bodies are details only.
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
            'publishedAt' => $this->when($isListOrDetails, $this->published_at),
            'title' => $this->when($isListOrDetails, $this->title),
            'excerpt' => $this->when($isListOrDetails, $this->excerpt),
            'body' => $this->when($isDetails, $this->body),
            'author' => $this->when($isListOrDetails, $this->author),
            'seoTitle' => $this->when($isListOrDetails, $this->seo_title),
            'seoDescription' => $this->when($isListOrDetails, $this->seo_description),
            'imageFileUrl' => $this->when($isListOrDetails, $this->image_file_url),
            'category' => $this->when($isListOrDetails, $this->category ? [
                'id' => $this->category->id,
                'slug' => $this->category->slug,
                'title' => $this->category->title,
            ] : null),
            'updatedAt' => $this->when($isListOrDetails, $this->updated_at),
        ];
    }
}
