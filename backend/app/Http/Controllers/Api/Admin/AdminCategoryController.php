<?php

namespace App\Http\Controllers\Api\Admin;

use App\Constant\PermissionType;
use App\Http\Controllers\Api\ApiController;
use App\Http\QueryFilter\CategoryFilter;
use App\Http\Requests\Admin\BulkDeleteRequest;
use App\Http\Requests\Admin\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminCategoryController extends ApiController
{
    public function __construct(protected CategoryService $categoryService)
    {
        $this->permissionPrefix = PermissionType::PermissionManageCategory->getSection();
        $this->resource = CategoryResource::class;
        $this->service = $categoryService;
        parent::__construct();
    }

    #[OA\Get(
        path: '/api/admin/categories',
        description: 'get all list categories',
        summary: 'get all categories',
        security: [['Bearer' => []]],
        tags: ['Admin Category'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(ref: "#/components/parameters/direction")]
    #[OA\Parameter(
        name: 'sort',
        description: 'Specify sorting order.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', enum: ['id', 'created_at', 'title', 'depth']),
        example: 'created_at'
    )]
    #[OA\Parameter(ref: "#/components/parameters/page")]
    #[OA\Parameter(ref: "#/components/parameters/limit")]
    #[OA\Parameter(
        name: 'search',
        description: 'Apply filter by title.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Parameter(
        name: 'publish',
        description: 'Apply filter by publish category.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'boolean')
    )]
    #[OA\Parameter(
        name: 'showMenu',
        description: 'Apply filter by show menu category.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'boolean')
    )]
    #[OA\Parameter(
        name: 'showInHomePage',
        description: 'Apply filter by show in home page category.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'boolean')
    )]
    #[OA\Parameter(
        name: 'feature',
        description: 'Apply filter by feature category.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'boolean')
    )]
    #[OA\Parameter(
        name: 'parentCategoryId',
        description: 'Apply filter by parent category id.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\Parameter(
        name: 'depth',
        description: 'Apply filter by category depth level (0 = root).',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'integer', minimum: 0)
    )]
    #[OA\Parameter(
        name: 'rootOnly',
        description: 'Return only root categories (without parent).',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'boolean')
    )]
    #[OA\Response(
        response: 200,
        description: 'Return Paginated Categories As Tree',
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
                                        items: new OA\Items(ref: '#/components/schemas/Category')
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
    public function index(CategoryFilter $categoryFilter): JsonResponse
    {
        return parent::baseIndex($categoryFilter);
    }

    /**
     * @throws \Exception
     */
    #[OA\Post(
        path: '/api/admin/categories',
        description: 'create new category',
        summary: 'create category',
        security: [['Bearer' => []]],
        tags: ['Admin Category'],
        parameters: [new OA\Parameter(ref: "#/components/parameters/x-locale")],
    )]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(ref: '#/components/schemas/CategoryStoreFormRequest')
        )
    )]
    #[OA\Response(
        response: 201,
        description: 'Returns Created Category',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Category', type: 'object'),
                ]
            )
        )
    )]
    public function store(CategoryRequest $categoryRequest): JsonResponse
    {
        return parent::baseStore($categoryRequest);
    }

    #[OA\Get(
        path: '/api/admin/categories/{category}',
        description: 'Fetches a single category by id',
        summary: 'Get one category',
        security: [['Bearer' => []]],
        tags: ['Admin Category'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(
        name: 'category',
        description: 'the category to retrieve',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns Get One Category',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Category', type: 'object'),
                ]
            )
        )
    )]
    public function show(Category $category): JsonResponse
    {
        return parent::baseShow($category->load($this->categoryService->getWithRelations()));
    }

    #[OA\Post(
        path: '/api/admin/categories/{category}',
        description: 'Update one category',
        summary: 'Update category',
        security: [['Bearer' => []]],
        tags: ['Admin Category'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(
        name: 'category',
        description: 'the category to update',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(ref: '#/components/schemas/CategoryUpdateFormRequest')
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns Updated Category',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Category', type: 'object'),
                ]
            )
        )
    )]
    public function update(CategoryRequest $categoryRequest, Category $category): JsonResponse
    {
        return parent::baseUpdate($categoryRequest, $category);
    }

    #[OA\Delete(
        path: '/api/admin/categories/{category}',
        description: 'delete a single category by id',
        summary: 'delete category',
        security: [['Bearer' => []]],
        tags: ['Admin Category'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(
        name: 'category',
        description: 'the category to delete',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns Deleted Category',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Category', type: 'object'),
                ]
            )
        )
    )]
    public function destroy(Category $category): JsonResponse
    {
        return parent::baseDestroy($category);
    }

    #[OA\Post(
        path: '/api/admin/categories/bulk-delete',
        description: 'delete many categories in one request',
        summary: 'bulk delete categories',
        security: [['Bearer' => []]],
        tags: ['Admin Category'],
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
        path: '/api/admin/categories/export',
        description: 'download every categories the current filters select as a csv file. The file carries all '
            . 'the columns of the record, its translated fields written in the language the x-locale header '
            . 'asks for, and the names behind its relations — a brand, a category, a product, never a bare '
            . 'id. It takes the same filters index() takes, without the paging.',
        summary: 'export categories as csv',
        security: [['Bearer' => []]],
        tags: ['Admin Category'],
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
    public function export(CategoryFilter $filter): StreamedResponse
    {
        return parent::baseExport($filter, 'categories');
    }
}
