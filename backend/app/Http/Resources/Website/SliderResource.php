<?php

namespace App\Http\Resources\Website;

use App\Constant\SerializedGroup;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Website shape: the request locale only, no translations block. Long bodies are details only.
 */
class SliderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $serializedGroup = $request->get('serializedGroup');
        $isDetails = $serializedGroup === SerializedGroup::Details->value;
        $isListOrDetails = $isDetails || $serializedGroup === SerializedGroup::List->value;

        return [
            'id' => $this->when($isListOrDetails, $this->id),
            'primaryPage' => $this->when($isListOrDetails, $this->primary_page),
            'secondaryPage' => $this->when($isListOrDetails, $this->secondary_page),
            'badge' => $this->when($isListOrDetails, $this->badge),
            'title' => $this->when($isListOrDetails, $this->title),
            'description' => $this->when($isListOrDetails, $this->description),
            'primaryButtonText' => $this->when($isListOrDetails, $this->primary_button_text),
            'secondaryButtonText' => $this->when($isListOrDetails, $this->secondary_button_text),
            'imageFileUrl' => $this->when($isListOrDetails, $this->image_file_url),
            'updatedAt' => $this->when($isListOrDetails, $this->updated_at),
        ];
    }
}
