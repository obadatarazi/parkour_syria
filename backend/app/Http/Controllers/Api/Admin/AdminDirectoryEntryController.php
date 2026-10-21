<?php

namespace App\Http\Controllers\Api\Admin;

use App\Constant\PermissionType;
use App\Http\Controllers\Api\ApiController;
use App\Http\QueryFilter\DirectoryEntryFilter;
use App\Http\Requests\Admin\BulkDeleteRequest;
use App\Http\Requests\Admin\DirectoryEntryRequest;
use App\Http\Resources\DirectoryEntryResource;
use App\Models\DirectoryEntry;
use App\Services\DirectoryEntryService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminDirectoryEntryController extends ApiController
{
    public function __construct(protected DirectoryEntryService $directoryEntryService)
    {
        $this->permissionPrefix = PermissionType::PermissionManageDirectoryEntry->getSection();
        $this->resource = DirectoryEntryResource::class;
        $this->service = $directoryEntryService;
        parent::__construct();
    }

    #[OA\Get(
        path: '/api/admin/directory-entries',
        description: 'get all directory entries, published or not',
        summary: 'get all directory entries',
        security: [['Bearer' => []]],
        tags: ['Admin Directory Entry'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(ref: '#/components/parameters/direction')]
    #[OA\Parameter(
        name: 'sort',
        description: 'Specify sorting order.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', enum: ['id', 'sort_order', 'created_at']),
        example: 'sort_order'
    )]
    #[OA\Parameter(ref: '#/components/parameters/page')]
    #[OA\Parameter(ref: '#/components/parameters/limit')]
    #[OA\Parameter(
        name: 'search',
        description: 'Free text search on name / description.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Parameter(
        name: 'publish',
        description: 'Filter by publish.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'boolean')
    )]
    #[OA\Parameter(
        name: 'verified',
        description: 'Filter by verified.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'boolean')
    )]
    #[OA\Parameter(
        name: 'type',
        description: 'Filter by type.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', enum: ['place', 'coach', 'team'])
    )]
    #[OA\Parameter(
        name: 'areaId',
        description: 'Filter by areaId.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\Parameter(
        name: 'area',
        description: 'Filter by the area slug.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Response(
        response: 200,
        description: 'Return all directory entries',
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
                                        items: new OA\Items(ref: '#/components/schemas/DirectoryEntry')
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
    public function index(DirectoryEntryFilter $filter): JsonResponse
    {
        return parent::baseIndex($filter);
    }

    #[OA\Post(
        path: '/api/admin/directory-entries',
        description: 'create a directory entry',
        summary: 'create directory entry',
        security: [['Bearer' => []]],
        tags: ['Admin Directory Entry'],
        parameters: [new OA\Parameter(ref: '#/components/parameters/x-locale')],
    )]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(ref: '#/components/schemas/DirectoryEntryStoreFormRequest')
        )
    )]
    #[OA\Response(
        response: 201,
        description: 'Returns the created directory entry',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/DirectoryEntry', type: 'object'),
                ]
            )
        )
    )]
    public function store(DirectoryEntryRequest $request): JsonResponse
    {
        return parent::baseStore($request);
    }

    #[OA\Get(
        path: '/api/admin/directory-entries/{directory_entry}',
        description: 'Fetches a single directory entry by id',
        summary: 'Get one directory entry',
        security: [['Bearer' => []]],
        tags: ['Admin Directory Entry'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(
        name: 'directory_entry',
        description: 'the directory entry to retrieve',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns one directory entry',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/DirectoryEntry', type: 'object'),
                ]
            )
        )
    )]
    public function show(DirectoryEntry $directoryEntry): JsonResponse
    {
        return parent::baseShow($directoryEntry->load($this->service->getWithRelations()));
    }

    #[OA\Post(
        path: '/api/admin/directory-entries/{directory_entry}',
        description: 'Update one directory entry. Send it as multipart with _method=PUT when an image is attached.',
        summary: 'Update directory entry',
        security: [['Bearer' => []]],
        tags: ['Admin Directory Entry'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(
        name: 'directory_entry',
        description: 'the directory entry to update',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(ref: '#/components/schemas/DirectoryEntryUpdateFormRequest')
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns the updated directory entry',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/DirectoryEntry', type: 'object'),
                ]
            )
        )
    )]
    public function update(DirectoryEntryRequest $request, DirectoryEntry $directoryEntry): JsonResponse
    {
        return parent::baseUpdate($request, $directoryEntry);
    }

    #[OA\Delete(
        path: '/api/admin/directory-entries/{directory_entry}',
        description: 'delete a single directory entry by id',
        summary: 'delete directory entry',
        security: [['Bearer' => []]],
        tags: ['Admin Directory Entry'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(
        name: 'directory_entry',
        description: 'the directory entry to delete',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns the deleted directory entry',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/DirectoryEntry', type: 'object'),
                ]
            )
        )
    )]
    public function destroy(DirectoryEntry $directoryEntry): JsonResponse
    {
        return parent::baseDestroy($directoryEntry);
    }

    #[OA\Post(
        path: '/api/admin/directory-entries/bulk-delete',
        description: 'delete many directory entries in one request',
        summary: 'bulk delete directory entries',
        security: [['Bearer' => []]],
        tags: ['Admin Directory Entry'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
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
        path: '/api/admin/directory-entries/export',
        description: 'download every directory entry the current filters select as a csv file, translated fields in '
            .'the language the x-locale header asks for. Takes the same filters as index(), without the paging.',
        summary: 'export directory entries as csv',
        security: [['Bearer' => []]],
        tags: ['Admin Directory Entry'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Response(
        response: 200,
        description: 'The csv file, as a download',
        content: new OA\MediaType(
            mediaType: 'text/csv',
            schema: new OA\Schema(type: 'string', format: 'binary')
        )
    )]
    public function export(DirectoryEntryFilter $filter): StreamedResponse
    {
        return parent::baseExport($filter, 'directory-entries');
    }
}
