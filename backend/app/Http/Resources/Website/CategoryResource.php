<?php

namespace App\Http\Resources\Website;

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
            'title' => $this->when($isListOrDetails, $this->title),
            'slug' => $this->when($isListOrDetails, $this->slug),
            'description' => $this->when($serializedGroup === SerializedGroup::Details->value, $this->description),
            'imageFileUrl' => $this->when($isListOrDetails, $this->image_file_url),
            'parentCategoryId' => $this->when($isListOrDetails, $this->parent_category_id),
        ];
    }
}
