<?php

namespace App\Http\Controllers\Api\Admin;

use App\Constant\PermissionType;
use App\Http\Controllers\Api\ApiController;
use App\Http\QueryFilter\ProductFilter;
use App\Http\Requests\Admin\BulkDeleteRequest;
use App\Http\Requests\Admin\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminProductController extends ApiController
{
    public function __construct(protected ProductService $productService)
    {
        $this->permissionPrefix = PermissionType::PermissionManageProduct->getSection();
        $this->resource = ProductResource::class;
        $this->service = $productService;
        parent::__construct();
    }

    #[OA\Get(
        path: '/api/admin/products',
        description: 'get all products, published or not',
        summary: 'get all products',
        security: [['Bearer' => []]],
        tags: ['Admin Product'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(ref: '#/components/parameters/direction')]
    #[OA\Parameter(
        name: 'sort',
        description: 'Specify sorting order.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', enum: ['id', 'price', 'created_at']),
        example: 'price'
    )]
    #[OA\Parameter(ref: '#/components/parameters/page')]
    #[OA\Parameter(ref: '#/components/parameters/limit')]
    #[OA\Parameter(
        name: 'search',
        description: 'Free text search on title / slug / sku_code.',
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
        name: 'brandId',
        description: 'Filter by brandId.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\Parameter(
        name: 'categoryId',
        description: 'Filter by categoryId.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\Response(
        response: 200,
        description: 'Return all products',
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
                                        items: new OA\Items(ref: '#/components/schemas/Product')
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
    public function index(ProductFilter $filter): JsonResponse
    {
        return parent::baseIndex($filter);
    }

    #[OA\Post(
        path: '/api/admin/products',
        description: 'create a product',
        summary: 'create product',
        security: [['Bearer' => []]],
        tags: ['Admin Product'],
        parameters: [new OA\Parameter(ref: '#/components/parameters/x-locale')],
    )]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(ref: '#/components/schemas/ProductStoreFormRequest')
        )
    )]
    #[OA\Response(
        response: 201,
        description: 'Returns the created product',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Product', type: 'object'),
                ]
            )
        )
    )]
    public function store(ProductRequest $request): JsonResponse
    {
        return parent::baseStore($request);
    }

    #[OA\Get(
        path: '/api/admin/products/{product}',
        description: 'Fetches a single product by id',
        summary: 'Get one product',
        security: [['Bearer' => []]],
        tags: ['Admin Product'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(
        name: 'product',
        description: 'the product to retrieve',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns one product',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Product', type: 'object'),
                ]
            )
        )
    )]
    public function show(Product $product): JsonResponse
    {
        return parent::baseShow($product->load($this->service->getWithRelations()));
    }

    #[OA\Post(
        path: '/api/admin/products/{product}',
        description: 'Update one product. Send it as multipart with _method=PUT when an image is attached.',
        summary: 'Update product',
        security: [['Bearer' => []]],
        tags: ['Admin Product'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(
        name: 'product',
        description: 'the product to update',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(ref: '#/components/schemas/ProductUpdateFormRequest')
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns the updated product',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Product', type: 'object'),
                ]
            )
        )
    )]
    public function update(ProductRequest $request, Product $product): JsonResponse
    {
        return parent::baseUpdate($request, $product);
    }

    #[OA\Delete(
        path: '/api/admin/products/{product}',
        description: 'delete a single product by id',
        summary: 'delete product',
        security: [['Bearer' => []]],
        tags: ['Admin Product'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(
        name: 'product',
        description: 'the product to delete',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns the deleted product',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Product', type: 'object'),
                ]
            )
        )
    )]
    public function destroy(Product $product): JsonResponse
    {
        return parent::baseDestroy($product);
    }

    #[OA\Post(
        path: '/api/admin/products/bulk-delete',
        description: 'delete many products in one request',
        summary: 'bulk delete products',
        security: [['Bearer' => []]],
        tags: ['Admin Product'],
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
        path: '/api/admin/products/export',
        description: 'download every product the current filters select as a csv file, translated fields in '
            .'the language the x-locale header asks for. Takes the same filters as index(), without the paging.',
        summary: 'export products as csv',
        security: [['Bearer' => []]],
        tags: ['Admin Product'],
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
    public function export(ProductFilter $filter): StreamedResponse
    {
        return parent::baseExport($filter, 'products');
    }
}
