<?php

namespace App\Http\Resources;

use App\Constant\SerializedGroup;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Dashboard shape: every column plus the translations of each locale.
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
            'sortOrder' => $this->when($isListOrDetails, $this->sort_order),
            'publish' => $this->when($isListOrDetails, (bool) $this->publish),
            'primaryPage' => $this->when($isListOrDetails, $this->primary_page),
            'secondaryPage' => $this->when($isListOrDetails, $this->secondary_page),
            'badge' => $this->when($isListOrDetails, $this->badge),
            'title' => $this->when($isListOrDetails, $this->title),
            'description' => $this->when($isListOrDetails, $this->description),
            'primaryButtonText' => $this->when($isListOrDetails, $this->primary_button_text),
            'secondaryButtonText' => $this->when($isListOrDetails, $this->secondary_button_text),
            'imageFileUrl' => $this->when($isListOrDetails, $this->image_file_url),
            'translations' => $this->when($isListOrDetails, $this->customTranslations),
            'createdAt' => $this->when($isListOrDetails, $this->created_at),
            'updatedAt' => $this->when($isListOrDetails, $this->updated_at),
        ];
    }
}
