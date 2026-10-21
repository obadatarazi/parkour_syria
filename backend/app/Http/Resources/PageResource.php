<?php

namespace App\Http\Resources;

use App\Constant\SerializedGroup;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Dashboard shape: every column plus the translations of each locale.
 */
class PageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $serializedGroup = $request->get('serializedGroup');
        $isDetails = $serializedGroup === SerializedGroup::Details->value;
        $isListOrDetails = $isDetails || $serializedGroup === SerializedGroup::List->value;

        return [
            'id' => $this->when($isListOrDetails, $this->id),
            'key' => $this->when($isListOrDetails, $this->key),
            'publish' => $this->when($isListOrDetails, (bool) $this->publish),
            'title' => $this->when($isListOrDetails, $this->title),
            'body' => $this->when($isDetails, $this->body),
            'seoTitle' => $this->when($isListOrDetails, $this->seo_title),
            'seoDescription' => $this->when($isListOrDetails, $this->seo_description),
            'imageFileUrl' => $this->when($isListOrDetails, $this->image_file_url),
            'translations' => $this->when($isListOrDetails, $this->customTranslations),
            'createdAt' => $this->when($isListOrDetails, $this->created_at),
            'updatedAt' => $this->when($isListOrDetails, $this->updated_at),
        ];
    }
}
