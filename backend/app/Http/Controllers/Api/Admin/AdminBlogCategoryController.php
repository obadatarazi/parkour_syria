<?php

namespace App\Http\Controllers\Api\Admin;

use App\Constant\PermissionType;
use App\Http\Controllers\Api\ApiController;
use App\Http\QueryFilter\BlogCategoryFilter;
use App\Http\Requests\Admin\BlogCategoryRequest;
use App\Http\Requests\Admin\BulkDeleteRequest;
use App\Http\Resources\BlogCategoryResource;
use App\Models\BlogCategory;
use App\Services\BlogCategoryService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminBlogCategoryController extends ApiController
{
    public function __construct(protected BlogCategoryService $blogCategoryService)
    {
        $this->permissionPrefix = PermissionType::PermissionManageBlogCategory->getSection();
        $this->resource = BlogCategoryResource::class;
        $this->service = $blogCategoryService;
        parent::__construct();
    }

    #[OA\Get(
        path: '/api/admin/blog-categories',
        description: 'get all blog categories, published or not',
        summary: 'get all blog categories',
        security: [['Bearer' => []]],
        tags: ['Admin Blog Category'],
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
        description: 'Free text search on title / slug.',
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
        description: 'Return all blog categories',
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
                                        items: new OA\Items(ref: '#/components/schemas/BlogCategory')
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
    public function index(BlogCategoryFilter $filter): JsonResponse
    {
        return parent::baseIndex($filter);
    }

    #[OA\Post(
        path: '/api/admin/blog-categories',
        description: 'create a blog category',
        summary: 'create blog category',
        security: [['Bearer' => []]],
        tags: ['Admin Blog Category'],
        parameters: [new OA\Parameter(ref: '#/components/parameters/x-locale')],
    )]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(ref: '#/components/schemas/BlogCategoryStoreFormRequest')
        )
    )]
    #[OA\Response(
        response: 201,
        description: 'Returns the created blog category',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/BlogCategory', type: 'object'),
                ]
            )
        )
    )]
    public function store(BlogCategoryRequest $request): JsonResponse
    {
        return parent::baseStore($request);
    }

    #[OA\Get(
        path: '/api/admin/blog-categories/{blog_category}',
        description: 'Fetches a single blog category by id',
        summary: 'Get one blog category',
        security: [['Bearer' => []]],
        tags: ['Admin Blog Category'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(
        name: 'blog_category',
        description: 'the blog category to retrieve',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns one blog category',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/BlogCategory', type: 'object'),
                ]
            )
        )
    )]
    public function show(BlogCategory $blogCategory): JsonResponse
    {
        return parent::baseShow($blogCategory->load($this->service->getWithRelations()));
    }

    #[OA\Post(
        path: '/api/admin/blog-categories/{blog_category}',
        description: 'Update one blog category. Send it as multipart with _method=PUT when an image is attached.',
        summary: 'Update blog category',
        security: [['Bearer' => []]],
        tags: ['Admin Blog Category'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(
        name: 'blog_category',
        description: 'the blog category to update',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(ref: '#/components/schemas/BlogCategoryUpdateFormRequest')
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns the updated blog category',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/BlogCategory', type: 'object'),
                ]
            )
        )
    )]
    public function update(BlogCategoryRequest $request, BlogCategory $blogCategory): JsonResponse
    {
        return parent::baseUpdate($request, $blogCategory);
    }

    #[OA\Delete(
        path: '/api/admin/blog-categories/{blog_category}',
        description: 'delete a single blog category by id',
        summary: 'delete blog category',
        security: [['Bearer' => []]],
        tags: ['Admin Blog Category'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(
        name: 'blog_category',
        description: 'the blog category to delete',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns the deleted blog category',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/BlogCategory', type: 'object'),
                ]
            )
        )
    )]
    public function destroy(BlogCategory $blogCategory): JsonResponse
    {
        return parent::baseDestroy($blogCategory);
    }

    #[OA\Post(
        path: '/api/admin/blog-categories/bulk-delete',
        description: 'delete many blog categories in one request',
        summary: 'bulk delete blog categories',
        security: [['Bearer' => []]],
        tags: ['Admin Blog Category'],
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
        path: '/api/admin/blog-categories/export',
        description: 'download every blog category the current filters select as a csv file, translated fields in '
            .'the language the x-locale header asks for. Takes the same filters as index(), without the paging.',
        summary: 'export blog categories as csv',
        security: [['Bearer' => []]],
        tags: ['Admin Blog Category'],
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
    public function export(BlogCategoryFilter $filter): StreamedResponse
    {
        return parent::baseExport($filter, 'blog-categories');
    }
}
