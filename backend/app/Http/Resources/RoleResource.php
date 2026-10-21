<?php

namespace App\Http\Resources;

use App\Constant\SerializedGroup;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use function Symfony\Component\Translation\t;

class RoleResource extends JsonResource
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

        // A role row names the role and says how big it is. The permissions themselves are the
        // whole point of the record and are drawn on the show page, not in the table.
        if ($serializedGroup === SerializedGroup::List->value) {
            return [
                'id' => $this->id,
                'name' => $this->name,
                'standard' => (bool) $this->standard,
                'permissionsCount' => $this->permissions_count !== null
                    ? (int) $this->permissions_count
                    : ($this->relationLoaded('permissions') ? $this->permissions->count() : 0),
            ];
        }

        $permissionArr = [];
        foreach($this->permissions as $permission) {
            $permissionArr[] = $permission->name;
        }

        return [
            'id' =>
                $this->when($serializedGroup === SerializedGroup::List->value || $serializedGroup === SerializedGroup::Details->value, $this->id),
            'name' =>
                $this->when($serializedGroup === SerializedGroup::List->value || $serializedGroup === SerializedGroup::Details->value, $this->name),
            'code' => $this->when($serializedGroup === SerializedGroup::Details->value, $this->code),
            'standard' => $this->when($serializedGroup === SerializedGroup::Details->value, $this->standard),
            'permissions' => $this->when($serializedGroup === SerializedGroup::List->value || $serializedGroup === SerializedGroup::Details->value, $permissionArr),
            'createdAt' => $this->when(
                $serializedGroup === SerializedGroup::Details->value || $serializedGroup === SerializedGroup::List->value, $this->created_at),
            'updatedAt' => $this->when(
                $serializedGroup === SerializedGroup::Details->value || $serializedGroup === SerializedGroup::List->value, $this->updated_at)
        ];
    }
};
