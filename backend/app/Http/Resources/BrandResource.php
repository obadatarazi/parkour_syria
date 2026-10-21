<?php

namespace App\Http\Resources;

use App\Constant\SerializedGroup;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BrandResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array
     */
    public function toArray(Request $request): array
    {
        $serializedGroup = $request->get('serializedGroup');

        // A brand row shows its logo, its name in each locale and whether it is published. The
        // description and the slugs belong to the record and are drawn on the show page.
        if ($serializedGroup === SerializedGroup::List->value) {
            $translations = [];

            foreach ($this->translations as $translation) {
                $translations[$translation->locale] = ['title' => $translation->title];
            }

            return [
                'id' => $this->id,
                'publish' => (bool) $this->publish,
                'imageFileUrl' => $this->logo_file_url,
                'translations' => $translations,
            ];
        }

        return [
            'id' =>
                $this->when($serializedGroup === SerializedGroup::List->value || $serializedGroup === SerializedGroup::Details->value, $this->id),
            'publish' =>
                $this->when($serializedGroup === SerializedGroup::Details->value || $serializedGroup === SerializedGroup::List->value, (bool)$this->publish),
            'title' =>
                $this->when($serializedGroup === SerializedGroup::List->value || $serializedGroup === SerializedGroup::Details->value, $this->title),
            'description' =>
                $this->when($serializedGroup === SerializedGroup::List->value || $serializedGroup === SerializedGroup::Details->value, $this->description),
            'slug' =>
                $this->when($serializedGroup === SerializedGroup::List->value || $serializedGroup === SerializedGroup::Details->value, $this->slug),
            'logoFileUrl' =>
                $this->when($serializedGroup === SerializedGroup::List->value || $serializedGroup === SerializedGroup::Details->value, $this->logo_file_url),
            'translations' => $this->when($serializedGroup === SerializedGroup::Details->value || $serializedGroup === SerializedGroup::List->value,
                $this->customTranslations),
            'createdAt' =>
                $this->when($serializedGroup === SerializedGroup::List->value || $serializedGroup === SerializedGroup::Details->value, $this->created_at),
            'updatedAt' =>
                $this->when($serializedGroup === SerializedGroup::List->value || $serializedGroup === SerializedGroup::Details->value, $this->updated_at)
        ];
    }
}
