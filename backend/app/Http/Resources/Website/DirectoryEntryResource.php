<?php

namespace App\Http\Resources\Website;

use App\Constant\SerializedGroup;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Website shape: the request locale only, no translations block. Long bodies are details only.
 */
class DirectoryEntryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $serializedGroup = $request->get('serializedGroup');
        $isDetails = $serializedGroup === SerializedGroup::Details->value;
        $isListOrDetails = $isDetails || $serializedGroup === SerializedGroup::List->value;

        return [
            'id' => $this->when($isListOrDetails, $this->id),
            'slug' => $this->when($isListOrDetails, $this->slug),
            'type' => $this->when($isListOrDetails, $this->type),
            'whatsapp' => $this->when($isListOrDetails, $this->whatsapp),
            'facebookUrl' => $this->when($isListOrDetails, $this->facebook_url),
            'instagramUrl' => $this->when($isListOrDetails, $this->instagram_url),
            'mapUrl' => $this->when($isListOrDetails, $this->map_url),
            'verified' => $this->when($isListOrDetails, (bool) $this->verified),
            'name' => $this->when($isListOrDetails, $this->name),
            'description' => $this->when($isListOrDetails, $this->description),
            'imageFileUrl' => $this->when($isListOrDetails, $this->image_file_url),
            'area' => $this->when($isListOrDetails, $this->area ? [
                'id' => $this->area->id,
                'slug' => $this->area->slug,
                'name' => $this->area->name,
            ] : null),
            'updatedAt' => $this->when($isListOrDetails, $this->updated_at),
        ];
    }
}
