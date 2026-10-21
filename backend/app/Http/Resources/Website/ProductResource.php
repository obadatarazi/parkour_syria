<?php

namespace App\Http\Resources\Website;

use App\Constant\SerializedGroup;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Website shape: the request locale only, no translations block. Long bodies are details only.
 */
class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $serializedGroup = $request->get('serializedGroup');
        $isDetails = $serializedGroup === SerializedGroup::Details->value;
        $isListOrDetails = $isDetails || $serializedGroup === SerializedGroup::List->value;

        return [
            'id' => $this->when($isListOrDetails, $this->id),
            'slug' => $this->when($isListOrDetails, $this->slug),
            'skuCode' => $this->when($isListOrDetails, $this->sku_code),
            'price' => $this->when($isListOrDetails, $this->price),
            'stock' => $this->when($isListOrDetails, $this->stock),
            'title' => $this->when($isListOrDetails, $this->title),
            'description' => $this->when($isListOrDetails, $this->description),
            'imageFileUrl' => $this->when($isListOrDetails, $this->image_file_url),
            'updatedAt' => $this->when($isListOrDetails, $this->updated_at),
        ];
    }
}
