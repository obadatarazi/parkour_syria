<?php

namespace App\Http\Resources\Website;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The home payload: each rail through the same website resource its own endpoint uses, so a card
 * looks the same wherever it is drawn. Rendered under the List group, long bodies stay out.
 */
class HomeCmsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $payload = $this->resource;

        return [
            'sliders' => SliderResource::collection($payload['sliders']),
            'latestBlogPosts' => BlogPostResource::collection($payload['latest_blog_posts']),
            'upcomingEvents' => EventResource::collection($payload['upcoming_events']),
            'featuredDirectoryEntries' => DirectoryEntryResource::collection($payload['featured_directory_entries']),
            'galleryImages' => GalleryImageResource::collection($payload['gallery_images']),
            'page' => $payload['page'] ? new PageResource($payload['page']) : null,
        ];
    }
}
