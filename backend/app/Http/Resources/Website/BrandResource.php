<?php

namespace App\Http\Resources\Website;

use App\Constant\SerializedGroup;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BrandResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $serializedGroup = $request->get('serializedGroup');

        return [
            'id' => $this->when($serializedGroup === SerializedGroup::List->value || $serializedGroup === SerializedGroup::Details->value, $this->id),
            'publish' => $this->when($serializedGroup === SerializedGroup::Details->value || $serializedGroup === SerializedGroup::List->value, (bool) $this->publish),
            'title' => $this->when($serializedGroup === SerializedGroup::List->value || $serializedGroup === SerializedGroup::Details->value, $this->title),
            'description' => $this->when($serializedGroup === SerializedGroup::Details->value, $this->description),
            'slug' => $this->when($serializedGroup === SerializedGroup::List->value || $serializedGroup === SerializedGroup::Details->value, $this->slug),
            'logoFileUrl' => $this->when($serializedGroup === SerializedGroup::List->value || $serializedGroup === SerializedGroup::Details->value, $this->logo_file_url),
            // Sitemap lastModified reads these off the list; the by-slug detail doesn't.
            'createdAt' => $this->when($serializedGroup === SerializedGroup::List->value, $this->created_at),
            'updatedAt' => $this->when($serializedGroup === SerializedGroup::List->value, $this->updated_at),
        ];
    }
}
