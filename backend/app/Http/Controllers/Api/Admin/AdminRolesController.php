<?php

namespace App\Http\Controllers\Api\Admin;

use App\Constant\PermissionType;
use App\Http\Controllers\Api\ApiController;
use App\Services\PermissionService;
use App\Services\RoleService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class AdminRolesController extends ApiController
{
    public function __construct(protected RoleService $roleService, private readonly PermissionService $permissionService)
    {
        $this->permissionPrefix = PermissionType::PermissionManageRole->getSection();
        $this->service = $roleService;
        parent::__construct();
    }

    #[OA\Get(
        path: '/api/admin/role/list',
        description: 'get all list roles',
        summary: 'get all roles',
        security: [['Bearer' => []]],
        tags: ['Admin Roles Section'],
        parameters: [new OA\Parameter(ref: "#/components/parameters/x-locale")],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Return All Roles',
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
                                                items: new OA\Items(ref: '#/components/schemas/Role')
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
    public function findAll(): JsonResponse
    {
        $data = $this->roleService->getAll();

        return $this->successResponse($data);
    }

    #[OA\Get(
        path: '/api/admin/role/by-section',
        description: 'Fetches a single role by section',
        summary: 'Get role  by section',
        security: [['Bearer' => []]],
        tags: ['Admin Roles Section'],
        parameters: [new OA\Parameter(ref: "#/components/parameters/x-locale")],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Returns Get Role By Section',
                content: new OA\MediaType(
                    mediaType: 'application/json',
                    schema: new OA\Schema(
                        properties: [
                            new OA\Property(property: 'success', type: 'boolean', example: true),
                            new OA\Property(property: 'data', ref: '#/components/schemas/Role', type: 'object'),
                        ]
                    )
                )
            ),
        ]
    )]
    public function getBySection(): JsonResponse
    {
        $data = $this->roleService->getBySection();

        $permissions = $this->permissionService->getAllPermissions();

        foreach ($data as &$item) {
            foreach ($item['roles'] as &$role) {
                foreach ($permissions as $permission) {
                    if ($permission->name === $role['name']) {
                        $role['id'] = $permission->id;
                        break;
                    }
                }
            }
        }

        return $this->successResponse($data);
    }
}
