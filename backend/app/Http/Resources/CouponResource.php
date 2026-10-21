<?php

namespace App\Http\Resources;

use App\Constant\SerializedGroup;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CouponResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $serializedGroup = $request->get('serializedGroup');
        $isListOrDetails = $serializedGroup === SerializedGroup::List->value || $serializedGroup === SerializedGroup::Details->value;

        return [
            'id' => $this->when($isListOrDetails, $this->id),
            'code' => $this->when($isListOrDetails, $this->code),
            'type' => $this->when($isListOrDetails, $this->type),
            'value' => $this->when($isListOrDetails, $this->value),
            'startsAt' => $this->when($isListOrDetails, $this->starts_at),
            'endsAt' => $this->when($isListOrDetails, $this->ends_at),
            'usageLimit' => $this->when($isListOrDetails, $this->usage_limit),
            'publish' => $this->when($isListOrDetails, (bool) $this->publish),
            'createdAt' => $this->when($isListOrDetails, $this->created_at),
            'updatedAt' => $this->when($isListOrDetails, $this->updated_at),
        ];
    }
}
