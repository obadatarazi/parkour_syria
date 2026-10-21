<?php

namespace App\Http\Resources;

use App\Constant\SerializedGroup;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $serializedGroup = $request->get('serializedGroup');
        $isDetails = $serializedGroup === SerializedGroup::Details->value;
        $isListOrDetails = $isDetails || $serializedGroup === SerializedGroup::List->value;

        return [
            'id' => $this->when($isListOrDetails, $this->id),
            'orderRefNumber' => $this->when($isListOrDetails, $this->order_ref_number),
            'status' => $this->when($isListOrDetails, $this->status),
            'customerName' => $this->when($isListOrDetails, $this->customer_name),
            'customerPhone' => $this->when($isListOrDetails, $this->customer_phone),
            'user' => $this->when($isListOrDetails, $this->user ? [
                'id' => $this->user->id,
                'fullName' => $this->user->full_name,
            ] : null),
            'subtotal' => $this->when($isListOrDetails, $this->subtotal),
            'discount' => $this->when($isListOrDetails, $this->discount),
            'total' => $this->when($isListOrDetails, $this->total),
            'itemsCount' => $this->when($serializedGroup === SerializedGroup::List->value, $this->items_count),
            'items' => $this->when($isDetails, fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'productId' => $item->product_id,
                'productTitle' => $item->product_title,
                'quantity' => $item->quantity,
                'unitPrice' => $item->unit_price,
                'total' => $item->total,
            ])),
            'note' => $this->when($isDetails, $this->note),
            'createdAt' => $this->when($isListOrDetails, $this->created_at),
            'updatedAt' => $this->when($isListOrDetails, $this->updated_at),
        ];
    }
}
