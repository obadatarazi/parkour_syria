<?php

namespace App\Http\Controllers\Api\Admin;

use App\Constant\PermissionType;
use App\Http\Controllers\Api\ApiController;
use App\Http\QueryFilter\AreaFilter;
use App\Http\Requests\Admin\AreaRequest;
use App\Http\Requests\Admin\BulkDeleteRequest;
use App\Http\Resources\AreaResource;
use App\Models\Area;
use App\Services\AreaService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminAreaController extends ApiController
{
    public function __construct(protected AreaService $areaService)
    {
        $this->permissionPrefix = PermissionType::PermissionManageArea->getSection();
        $this->resource = AreaResource::class;
        $this->service = $areaService;
        parent::__construct();
    }

    #[OA\Get(
        path: '/api/admin/areas',
        description: 'get all areas, published or not',
        summary: 'get all areas',
        security: [['Bearer' => []]],
        tags: ['Admin Area'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(ref: "#/components/parameters/direction")]
    #[OA\Parameter(
        name: 'sort',
        description: 'Specify sorting order.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', enum: ['id', 'sort_order', 'created_at']),
        example: 'sort_order'
    )]
    #[OA\Parameter(ref: "#/components/parameters/page")]
    #[OA\Parameter(ref: "#/components/parameters/limit")]
    #[OA\Parameter(
        name: 'search',
        description: 'Free text search on name / slug.',
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
    #[OA\Response(
        response: 200,
        description: 'Return all areas',
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
                                        items: new OA\Items(ref: '#/components/schemas/Area')
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
    public function index(AreaFilter $filter): JsonResponse
    {
        return parent::baseIndex($filter);
    }

    #[OA\Post(
        path: '/api/admin/areas',
        description: 'create a area',
        summary: 'create area',
        security: [['Bearer' => []]],
        tags: ['Admin Area'],
        parameters: [new OA\Parameter(ref: "#/components/parameters/x-locale")],
    )]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(ref: '#/components/schemas/AreaStoreFormRequest')
        )
    )]
    #[OA\Response(
        response: 201,
        description: 'Returns the created area',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Area', type: 'object'),
                ]
            )
        )
    )]
    public function store(AreaRequest $request): JsonResponse
    {
        return parent::baseStore($request);
    }

    #[OA\Get(
        path: '/api/admin/areas/{area}',
        description: 'Fetches a single area by id',
        summary: 'Get one area',
        security: [['Bearer' => []]],
        tags: ['Admin Area'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(
        name: 'area',
        description: 'the area to retrieve',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns one area',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Area', type: 'object'),
                ]
            )
        )
    )]
    public function show(Area $area): JsonResponse
    {
        return parent::baseShow($area->load($this->service->getWithRelations()));
    }

    #[OA\Post(
        path: '/api/admin/areas/{area}',
        description: 'Update one area. Send it as multipart with _method=PUT when an image is attached.',
        summary: 'Update area',
        security: [['Bearer' => []]],
        tags: ['Admin Area'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(
        name: 'area',
        description: 'the area to update',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(ref: '#/components/schemas/AreaUpdateFormRequest')
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns the updated area',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Area', type: 'object'),
                ]
            )
        )
    )]
    public function update(AreaRequest $request, Area $area): JsonResponse
    {
        return parent::baseUpdate($request, $area);
    }

    #[OA\Delete(
        path: '/api/admin/areas/{area}',
        description: 'delete a single area by id',
        summary: 'delete area',
        security: [['Bearer' => []]],
        tags: ['Admin Area'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(
        name: 'area',
        description: 'the area to delete',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns the deleted area',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Area', type: 'object'),
                ]
            )
        )
    )]
    public function destroy(Area $area): JsonResponse
    {
        return parent::baseDestroy($area);
    }

    #[OA\Post(
        path: '/api/admin/areas/bulk-delete',
        description: 'delete many areas in one request',
        summary: 'bulk delete areas',
        security: [['Bearer' => []]],
        tags: ['Admin Area'],
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
        path: '/api/admin/areas/export',
        description: 'download every area the current filters select as a csv file, translated fields in '
            . 'the language the x-locale header asks for. Takes the same filters as index(), without the paging.',
        summary: 'export areas as csv',
        security: [['Bearer' => []]],
        tags: ['Admin Area'],
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
    public function export(AreaFilter $filter): StreamedResponse
    {
        return parent::baseExport($filter, 'areas');
    }
}
