<?php

namespace App\Http\Resources;

use App\Constant\SerializedGroup;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TagResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $serializedGroup = $request->get('serializedGroup');

        // A tag row shows its name in each locale and whether it is published. A tag carries no
        // picture, so the row has none to draw. The slugs are drawn on the show page.
        if ($serializedGroup === SerializedGroup::List->value) {
            $translations = [];

            foreach ($this->translations as $translation) {
                $translations[$translation->locale] = ['title' => $translation->title];
            }

            return [
                'id' => $this->id,
                'publish' => (bool) $this->publish,
                'translations' => $translations,
            ];
        }

        return [
            'id' => $this->when($serializedGroup === SerializedGroup::List->value || $serializedGroup === SerializedGroup::Details->value, $this->id),
            'publish' => $this->when($serializedGroup === SerializedGroup::Details->value || $serializedGroup === SerializedGroup::List->value, (bool) $this->publish),
            'title' => $this->when($serializedGroup === SerializedGroup::List->value || $serializedGroup === SerializedGroup::Details->value, $this->title),
            'slug' => $this->when($serializedGroup === SerializedGroup::List->value || $serializedGroup === SerializedGroup::Details->value, $this->slug),
            'translations' => $this->when($serializedGroup === SerializedGroup::Details->value || $serializedGroup === SerializedGroup::List->value,
                $this->customTranslations),
            'createdAt' => $this->when($serializedGroup === SerializedGroup::List->value || $serializedGroup === SerializedGroup::Details->value, $this->created_at),
            'updatedAt' => $this->when($serializedGroup === SerializedGroup::List->value || $serializedGroup === SerializedGroup::Details->value, $this->updated_at),
        ];
    }
}
