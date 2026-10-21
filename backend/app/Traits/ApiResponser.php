<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponser
{
    /**
     * Lean JSON for every API payload: keep Unicode (Arabic) and slashes unescaped so responses
     * stay smaller on the wire without changing the public shape.
     */
    private const JSON_ENCODE_FLAGS = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES;

    protected $resourceClass;

    public function successPaginatedResponse($resourceClass, $data, array $extra = []): JsonResponse
    {
        $items = $resourceClass::collection($data);

        $res = $extra + [
            'success' => true,
            'statusCode' => 200,
            'pagination' => [
                'page' => $data->currentPage(),
                'limit' => $data->perPage(),
                'pages' => ceil($data->total() / $data->perPage()),
                'totalItems' => $data->total(),
                'items' => $items,
            ],
        ];

        return response()->json($res, 200, [], self::JSON_ENCODE_FLAGS);
    }

    /**
     * success response method.
     *
     * @param  null  $message
     */
    protected function successResponse($data, int $code = 200, $message = null): JsonResponse
    {
        if ($this->resourceClass) {
            $data = new $this->resourceClass($data);
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $code, [], self::JSON_ENCODE_FLAGS);
    }

    /**
     * error response method.
     *
     * @param  null  $error
     * @param  int  $code
     */
    protected function errorResponse($error = null, $code = 500): JsonResponse
    {
        return response()->json([
            'success' => false,
            'error' => $error,
        ], $code, [], self::JSON_ENCODE_FLAGS);
    }

    public function successCustomResponse($resourceClass, $data): JsonResponse
    {
        $res = $resourceClass::collection($data);

        return response()->json($res, 200, [], self::JSON_ENCODE_FLAGS);
    }

    public function setSerializedGroup($group): self
    {
        request()['serializedGroup'] = $group;

        return $this;
    }

    public function setResourceClass($resourceClass): self
    {
        $this->resourceClass = $resourceClass;

        return $this;
    }
}
