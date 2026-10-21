<?php

namespace App\Http\Resources;

use App\Constant\SerializedGroup;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Dashboard shape: every column plus the translations of each locale.
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
            'brandId' => $this->when($isListOrDetails, $this->brand_id),
            'categoryId' => $this->when($isListOrDetails, $this->category_id),
            'price' => $this->when($isListOrDetails, $this->price),
            'stock' => $this->when($isListOrDetails, $this->stock),
            'publish' => $this->when($isListOrDetails, (bool) $this->publish),
            'title' => $this->when($isListOrDetails, $this->title),
            'description' => $this->when($isListOrDetails, $this->description),
            'imageFileUrl' => $this->when($isListOrDetails, $this->image_file_url),
            'translations' => $this->when($isListOrDetails, $this->customTranslations),
            'createdAt' => $this->when($isListOrDetails, $this->created_at),
            'updatedAt' => $this->when($isListOrDetails, $this->updated_at),
        ];
    }
}
