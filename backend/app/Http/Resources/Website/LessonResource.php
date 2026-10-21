<?php

namespace App\Http\Resources\Website;

use App\Constant\SerializedGroup;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Website shape: the request locale only, no translations block. Long bodies are details only.
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
            'youtubeUrl' => $this->when($isListOrDetails, $this->youtube_url),
            'title' => $this->when($isListOrDetails, $this->title),
            'summary' => $this->when($isListOrDetails, $this->summary),
            'body' => $this->when($isDetails, $this->body),
            'safetyNote' => $this->when($isListOrDetails, $this->safety_note),
            'imageFileUrl' => $this->when($isListOrDetails, $this->image_file_url),
            'updatedAt' => $this->when($isListOrDetails, $this->updated_at),
        ];
    }
}
