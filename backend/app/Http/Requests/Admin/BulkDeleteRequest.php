<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\CustomFormRequest;

/**
 * The body every bulk delete endpoint reads. It is deliberately model agnostic: the ids are only
 * checked for their shape here, whether a row actually exists is answered by the query the service
 * runs, which reports the ids it could not find instead of failing the whole call.
 *
 * @see \App\Services\BaseService::bulkDelete()
 */
class BulkDeleteRequest extends CustomFormRequest
{
    /**
     * A ceiling on one call. A delete cascades through relations and files, so a request that asks
     * for thousands of rows is a request that times out halfway through.
     */
    public const MAX_IDS = 500;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:1', 'max:' . self::MAX_IDS],
            'ids.*' => ['required', 'integer', 'min:1', 'distinct'],
        ];
    }
}
