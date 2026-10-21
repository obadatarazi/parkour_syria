<?php

namespace App\Http\Resources;

use App\Constant\SerializedGroup;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Dashboard shape: every column plus the translations of each locale.
 */
class LessonResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $serializedGroup = $request->get('serializedGroup');
        $isDetails = $serializedGroup === SerializedGroup::Details->value;
        $isListOrDetails = $isDetails || $serializedGroup === SerializedGroup::List->value;

        return [
            'id' => $this->when($isListOrDetails, $this->id),
            'slug' => $this->when($isListOrDetails, $this->slug),
            'sortOrder' => $this->when($isListOrDetails, $this->sort_order),
            'youtubeUrl' => $this->when($isListOrDetails, $this->youtube_url),
            'publish' => $this->when($isListOrDetails, (bool) $this->publish),
            'title' => $this->when($isListOrDetails, $this->title),
            'summary' => $this->when($isListOrDetails, $this->summary),
            'body' => $this->when($isDetails, $this->body),
            'safetyNote' => $this->when($isListOrDetails, $this->safety_note),
            'imageFileUrl' => $this->when($isListOrDetails, $this->image_file_url),
            'translations' => $this->when($isListOrDetails, $this->customTranslations),
            'createdAt' => $this->when($isListOrDetails, $this->created_at),
            'updatedAt' => $this->when($isListOrDetails, $this->updated_at),
        ];
    }
}
