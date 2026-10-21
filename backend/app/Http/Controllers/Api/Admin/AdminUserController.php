<?php

namespace App\Http\Controllers\Api\Admin;

use App\Constant\PermissionType;
use App\Http\Controllers\Api\ApiController;
use App\Http\QueryFilter\UserFilter;
use App\Http\Requests\Admin\BulkDeleteRequest;
use App\Http\Requests\Admin\UserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminUserController extends ApiController
{
    public function __construct(protected UserService $userService)
    {
        $this->permissionPrefix = PermissionType::PermissionManageUser->getSection();
        $this->resource = UserResource::class;
        $this->service = $userService;
        parent::__construct();
    }

    #[OA\Get(
        path: '/api/admin/users',
        description: 'get all list users',
        summary: 'get all users',
        security: [['Bearer' => []]],
        tags: ['Admin User'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(ref: "#/components/parameters/direction")]
    #[OA\Parameter(ref: "#/components/parameters/page")]
    #[OA\Parameter(ref: "#/components/parameters/limit")]
    #[OA\Parameter(
        name: 'sort',
        description: 'Specify sorting order.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', enum: ['id', 'full_name', 'email', 'phone_number', 'created_at', 'gender']),
        example: 'id'
    )]
    #[OA\Parameter(
        name: 'search',
        description: 'Apply filter by full name.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Parameter(
        name: 'email',
        description: 'Apply filter by email.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Parameter(
        name: 'phoneNumber',
        description: 'Apply filter by phone number.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Parameter(
        name: 'gender',
        description: 'Apply filter by gender.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', enum: ['MALE', 'FEMALE']),
    )]
    #[OA\Parameter(
        name: 'type',
        description: 'Apply filter by user type.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', enum: ['ADMIN', 'CUSTOMER']),
    )]
    #[OA\Parameter(
        name: 'role',
        description: 'Apply filter by role id.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\Parameter(
        name: 'active',
        description: 'Apply filter by active account status.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'boolean')
    )]
    #[OA\Parameter(
        name: 'stateId',
        description: 'Apply filter by state id.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\Response(
        response: 200,
        description: 'Return All Users',
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
                                        items: new OA\Items(ref: '#/components/schemas/User')
                                    ),
                                ],
                                type: 'object'
                            ),
                        ]
                    ),
                ]
            )
        )
    )]
    public function index(UserFilter $userFilter): JsonResponse
    {
        return parent::baseIndex($userFilter);
    }

    /**
     * @throws \Exception
     */
    #[OA\Post(
        path: '/api/admin/users',
        description: 'create new user',
        summary: 'create user',
        security: [['Bearer' => []]],
        tags: ['Admin User'],
        parameters: [new OA\Parameter(ref: "#/components/parameters/x-locale")],
    )]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(ref: '#/components/schemas/UserStoreFormRequest')
        )
    )]
    #[OA\Response(
        response: 201,
        description: 'Returns Created User',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/User', type: 'object'),
                ]
            )
        )
    )]
    public function store(UserRequest $userRequest): JsonResponse
    {
        return parent::baseStore($userRequest);
    }

    #[OA\Get(
        path: '/api/admin/users/{user}',
        description: 'Fetches a single user by id',
        summary: 'Get one user',
        security: [['Bearer' => []]],
        tags: ['Admin User'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(
        name: 'user',
        description: 'the user to retrieve',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns Get One User',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/User', type: 'object'),
                ]
            )
        )
    )]
    public function show(User $user): JsonResponse
    {
        $user->load(['state', 'roles']);

        return parent::baseShow($user);
    }

    #[OA\Post(
        path: '/api/admin/users/{user}',
        description: 'Update one user',
        summary: 'Update user',
        security: [['Bearer' => []]],
        tags: ['Admin User'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(
        name: 'user',
        description: 'the user to update',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(ref: '#/components/schemas/UserUpdateFormRequest')
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns Updated User',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/User', type: 'object'),
                ]
            )
        )
    )]
    public function update(UserRequest $userRequest, User $user): JsonResponse
    {
        return parent::baseUpdate($userRequest, $user);
    }

    #[OA\Delete(
        path: '/api/admin/users/{user}',
        description: 'delete a single user by id',
        summary: 'delete user',
        security: [['Bearer' => []]],
        tags: ['Admin User'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(
        name: 'user',
        description: 'the user to delete',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns Deleted User',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/User', type: 'object'),
                ]
            )
        )
    )]
    public function destroy(User $user): JsonResponse
    {
        return parent::baseDestroy($user);
    }

    #[OA\Post(
        path: '/api/admin/users/bulk-delete',
        description: 'delete many users in one request',
        summary: 'bulk delete users',
        security: [['Bearer' => []]],
        tags: ['Admin User'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(ref: '#/components/schemas/BulkDeleteFormRequest')
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns the outcome of the bulk delete',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(ref: '#/components/schemas/BulkDeleteResult')
        )
    )]
    public function bulkDestroy(BulkDeleteRequest $bulkDeleteRequest): JsonResponse
    {
        return parent::baseBulkDestroy($bulkDeleteRequest);
    }

    #[OA\Get(
        path: '/api/admin/users/export',
        description: 'download every users the current filters select as a csv file. The file carries all '
            . 'the columns of the record, its translated fields written in the language the x-locale header '
            . 'asks for, and the names behind its relations — a brand, a category, a product, never a bare '
            . 'id. It takes the same filters index() takes, without the paging.',
        summary: 'export users as csv',
        security: [['Bearer' => []]],
        tags: ['Admin User'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Response(
        response: 200,
        description: 'The csv file, as a download',
        content: new OA\MediaType(
            mediaType: 'text/csv',
            schema: new OA\Schema(type: 'string', format: 'binary')
        )
    )]
    public function export(UserFilter $filter): StreamedResponse
    {
        return parent::baseExport($filter, 'users');
    }
}
