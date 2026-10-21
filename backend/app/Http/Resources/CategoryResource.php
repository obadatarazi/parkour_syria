<?php

namespace App\Http\Resources;

use App\Constant\SerializedGroup;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $serializedGroup = $request->get('serializedGroup');
        $isListOrDetails = $serializedGroup === SerializedGroup::List->value || $serializedGroup === SerializedGroup::Details->value;

        return [
            'id' => $this->when($isListOrDetails, $this->id),
            'publish' => $this->when($isListOrDetails, (bool) $this->publish),
            'title' => $this->when($isListOrDetails, $this->title),
            'slug' => $this->when($isListOrDetails, $this->slug),
            'description' => $this->when($serializedGroup === SerializedGroup::Details->value, $this->description),
            'imageFileUrl' => $this->when($isListOrDetails, $this->image_file_url),
            'parentCategory' => $this->when($isListOrDetails, $this->parent ? [
                'id' => $this->parent->id,
                'title' => $this->parent->title,
            ] : null),
            'translations' => $this->when($isListOrDetails, $this->customTranslations),
            'createdAt' => $this->when($isListOrDetails, $this->created_at),
            'updatedAt' => $this->when($isListOrDetails, $this->updated_at),
        ];
    }
}
