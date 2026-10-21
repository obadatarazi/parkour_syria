<?php

namespace App\Http\Controllers\Api\Admin;

use App\Constant\PermissionType;
use App\Http\Controllers\Api\ApiController;
use App\Http\QueryFilter\BrandFilter;
use App\Http\Requests\Admin\BrandRequest;
use App\Http\Requests\Admin\BulkDeleteRequest;
use App\Http\Resources\BrandResource;
use App\Models\Brand;
use App\Services\BrandService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminBrandController extends ApiController
{
    public function __construct(protected BrandService $brandService)
    {
        $this->permissionPrefix = PermissionType::PermissionManageBrand->getSection();
        $this->resource = BrandResource::class;
        $this->service = $brandService;
        parent::__construct();
    }

    #[OA\Get(
        path: '/api/admin/brands',
        description: 'get all list brands',
        summary: 'get all brands',
        security: [['Bearer' => []]],
        tags: ['Admin Brand'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(ref: '#/components/parameters/direction')]
    #[OA\Parameter(
        name: 'sort',
        description: 'Specify sorting order.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', enum: ['id', 'created_at', 'title']),
        example: 'created_at'
    )]
    #[OA\Parameter(ref: '#/components/parameters/page')]
    #[OA\Parameter(ref: '#/components/parameters/limit')]
    #[OA\Parameter(
        name: 'search',
        description: 'Apply filter by title.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Parameter(
        name: 'publish',
        description: 'Apply filter by publish brand.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'boolean')
    )]
    #[OA\Response(
        response: 200,
        description: 'Return All Brands',
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
                                        items: new OA\Items(ref: '#/components/schemas/Brand')
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
    public function index(BrandFilter $brandFilter): JsonResponse
    {
        return parent::baseIndex($brandFilter);
    }

    /**
     * @throws \Exception
     */
    #[OA\Post(
        path: '/api/admin/brands',
        description: 'create new brand',
        summary: 'create brand',
        security: [['Bearer' => []]],
        tags: ['Admin Brand'],
        parameters: [new OA\Parameter(ref: '#/components/parameters/x-locale')],
    )]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(ref: '#/components/schemas/BrandStoreFormRequest')
        )
    )]
    #[OA\Response(
        response: 201,
        description: 'Returns Created Brand',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Brand', type: 'object'),
                ]
            )
        )
    )]
    public function store(BrandRequest $brandRequest): JsonResponse
    {
        return parent::baseStore($brandRequest);
    }

    #[OA\Get(
        path: '/api/admin/brands/{brand}',
        description: 'Fetches a single brand by id',
        summary: 'Get one brand',
        security: [['Bearer' => []]],
        tags: ['Admin Brand'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(
        name: 'brand',
        description: 'the brand to retrieve',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns Get One Brand',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Brand', type: 'object'),
                ]
            )
        )
    )]
    public function show(Brand $brand): JsonResponse
    {
        return parent::baseShow($brand);
    }

    #[OA\Post(
        path: '/api/admin/brands/{brand}',
        description: 'Update one brand',
        summary: 'Update brand',
        security: [['Bearer' => []]],
        tags: ['Admin Brand'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(
        name: 'brand',
        description: 'the brand to update',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(ref: '#/components/schemas/BrandUpdateFormRequest')
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns Updated Brand',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Brand', type: 'object'),
                ]
            )
        )
    )]
    public function update(BrandRequest $brandRequest, Brand $brand): JsonResponse
    {
        return parent::baseUpdate($brandRequest, $brand);
    }

    #[OA\Delete(
        path: '/api/admin/brands/{brand}',
        description: 'delete a single brand by id',
        summary: 'delete brand',
        security: [['Bearer' => []]],
        tags: ['Admin Brand'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(
        name: 'brand',
        description: 'the brand to delete',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns Deleted Brand',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Brand', type: 'object'),
                ]
            )
        )
    )]
    public function destroy(Brand $brand): JsonResponse
    {
        return parent::baseDestroy($brand);
    }

    #[OA\Post(
        path: '/api/admin/brands/bulk-delete',
        description: 'delete many brands in one request',
        summary: 'bulk delete brands',
        security: [['Bearer' => []]],
        tags: ['Admin Brand'],
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
        path: '/api/admin/brands/export',
        description: 'download every brands the current filters select as a csv file. The file carries all '
            .'the columns of the record, its translated fields written in the language the x-locale header '
            .'asks for, and the names behind its relations — a brand, a category, a product, never a bare '
            .'id. It takes the same filters index() takes, without the paging.',
        summary: 'export brands as csv',
        security: [['Bearer' => []]],
        tags: ['Admin Brand'],
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
    public function export(BrandFilter $filter): StreamedResponse
    {
        return parent::baseExport($filter, 'brands');
    }
}
