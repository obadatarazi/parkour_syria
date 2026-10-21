<?php

namespace App\Http\Controllers\Api\Admin;

use App\Constant\PermissionType;
use App\Http\Controllers\Api\ApiController;
use App\Http\QueryFilter\PermissionFilter;
use App\Http\Resources\PermissionResource;
use App\Services\PermissionService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class AdminPermissionController extends ApiController
{
    public function __construct(protected PermissionService $permissionService)
    {
        $permissionRoleList = PermissionType::PermissionList->getPermission();
        $this->resource = PermissionResource::class;
        $this->service = $permissionService;
        $this->middleware(['permission:' . $permissionRoleList], ['only' => ['index']]);
    }

    #[OA\Get(
        path: '/api/admin/permissions',
        description: 'get all list permissions',
        summary: 'get all permissions',
        security: [['Bearer' => []]],
        tags: ['Admin Permission'],
        parameters: [
            new OA\Parameter(ref: "#/components/parameters/direction"),
            new OA\Parameter(ref: "#/components/parameters/page"),
            new OA\Parameter(ref: "#/components/parameters/limit"),
            new OA\Parameter(
                name: 'sort',
                description: 'Specify sorting order.',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'string', enum: ['id', 'name', 'created_at']),
                example: 'id'
            ),
            new OA\Parameter(
                name: 'search',
                description: 'Apply filter by name permission.',
                in: 'query',
                schema: new OA\Schema(type: 'string')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Return All Permissions',
                content: new OA\MediaType(
                    mediaType: 'application/json',
                    schema: new OA\Schema(
                        allOf: [
                            new OA\Schema(ref: '#/components/schemas/Pagination'),
                            new OA\Schema(
                                properties: [
                                    new OA\Property(
                                        property: 'pagination',
                                        properties: [
                                            new OA\Property(
                                                property: 'items',
                                                type: 'array',
                                                items: new OA\Items(ref: '#/components/schemas/Permission')
                                            ),
                                        ],
                                        type: 'object'
                                    ),
                                ]
                            ),
                        ]
                    )
                )
            ),
        ]
    )]
    public function index(PermissionFilter $permissionFilter): JsonResponse
    {
        return parent::baseIndex($permissionFilter);
    }
}
