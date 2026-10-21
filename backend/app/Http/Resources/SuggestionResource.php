<?php

namespace App\Http\Resources;

use App\Constant\SerializedGroup;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SuggestionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $serializedGroup = $request->get('serializedGroup');
        $isDetails = $serializedGroup === SerializedGroup::Details->value;
        $isListOrDetails = $isDetails || $serializedGroup === SerializedGroup::List->value;

        return [
            'id' => $this->when($isListOrDetails, $this->id),
            'type' => $this->when($isListOrDetails, $this->type),
            'status' => $this->when($isListOrDetails, $this->status),
            'name' => $this->when($isListOrDetails, $this->name),
            'area' => $this->when($isListOrDetails, $this->area ? [
                'id' => $this->area->id,
                'slug' => $this->area->slug,
                'name' => $this->area->name,
            ] : null),
            'description' => $this->when($isListOrDetails, $this->description),
            'contact' => $this->when($isListOrDetails, $this->contact),
            'imageFileUrl' => $this->when($isListOrDetails, $this->image_file_url),
            'startsAt' => $this->when($isListOrDetails, $this->starts_at),
            'proposerName' => $this->when($isListOrDetails, $this->proposer_name),
            'proposerContact' => $this->when($isListOrDetails, $this->proposer_contact),
            'payload' => $this->when($isDetails, $this->payload),
            'safetyAccepted' => $this->when($isListOrDetails, (bool) $this->safety_accepted),
            'rejectReason' => $this->when($isListOrDetails, $this->reject_reason),
            'reviewedBy' => $this->when($isDetails, $this->reviewer ? [
                'id' => $this->reviewer->id,
                'fullName' => $this->reviewer->full_name,
            ] : null),
            'reviewedAt' => $this->when($isListOrDetails, $this->reviewed_at),
            'promotedType' => $this->when($isListOrDetails, $this->promoted_type),
            'promotedId' => $this->when($isListOrDetails, $this->promoted_id),
            'createdAt' => $this->when($isListOrDetails, $this->created_at),
            'updatedAt' => $this->when($isListOrDetails, $this->updated_at),
        ];
    }
}
