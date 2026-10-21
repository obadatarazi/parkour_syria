<?php

namespace App\Http\Controllers\Api\Admin;

use App\Constant\PermissionType;
use App\Http\Controllers\Api\ApiController;
use App\Http\QueryFilter\BlogPostFilter;
use App\Http\Requests\Admin\BlogPostRequest;
use App\Http\Requests\Admin\BulkDeleteRequest;
use App\Http\Resources\BlogPostResource;
use App\Models\BlogPost;
use App\Services\BlogPostService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminBlogPostController extends ApiController
{
    public function __construct(protected BlogPostService $blogPostService)
    {
        $this->permissionPrefix = PermissionType::PermissionManageBlogPost->getSection();
        $this->resource = BlogPostResource::class;
        $this->service = $blogPostService;
        parent::__construct();
    }

    #[OA\Get(
        path: '/api/admin/blog-posts',
        description: 'get all blog posts, published or not',
        summary: 'get all blog posts',
        security: [['Bearer' => []]],
        tags: ['Admin Blog Post'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(ref: "#/components/parameters/direction")]
    #[OA\Parameter(
        name: 'sort',
        description: 'Specify sorting order.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', enum: ['id', 'published_at', 'created_at']),
        example: 'published_at'
    )]
    #[OA\Parameter(ref: "#/components/parameters/page")]
    #[OA\Parameter(ref: "#/components/parameters/limit")]
    #[OA\Parameter(
        name: 'search',
        description: 'Free text search on title / excerpt.',
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
        name: 'blogCategoryId',
        description: 'Filter by blogCategoryId.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\Parameter(
        name: 'category',
        description: 'Filter by the blog category slug.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Response(
        response: 200,
        description: 'Return all blog posts',
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
                                        items: new OA\Items(ref: '#/components/schemas/BlogPost')
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
    public function index(BlogPostFilter $filter): JsonResponse
    {
        return parent::baseIndex($filter);
    }

    #[OA\Post(
        path: '/api/admin/blog-posts',
        description: 'create a blog post',
        summary: 'create blog post',
        security: [['Bearer' => []]],
        tags: ['Admin Blog Post'],
        parameters: [new OA\Parameter(ref: "#/components/parameters/x-locale")],
    )]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(ref: '#/components/schemas/BlogPostStoreFormRequest')
        )
    )]
    #[OA\Response(
        response: 201,
        description: 'Returns the created blog post',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/BlogPost', type: 'object'),
                ]
            )
        )
    )]
    public function store(BlogPostRequest $request): JsonResponse
    {
        return parent::baseStore($request);
    }

    #[OA\Get(
        path: '/api/admin/blog-posts/{blog_post}',
        description: 'Fetches a single blog post by id',
        summary: 'Get one blog post',
        security: [['Bearer' => []]],
        tags: ['Admin Blog Post'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(
        name: 'blog_post',
        description: 'the blog post to retrieve',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns one blog post',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/BlogPost', type: 'object'),
                ]
            )
        )
    )]
    public function show(BlogPost $blogPost): JsonResponse
    {
        return parent::baseShow($blogPost->load($this->service->getWithRelations()));
    }

    #[OA\Post(
        path: '/api/admin/blog-posts/{blog_post}',
        description: 'Update one blog post. Send it as multipart with _method=PUT when an image is attached.',
        summary: 'Update blog post',
        security: [['Bearer' => []]],
        tags: ['Admin Blog Post'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(
        name: 'blog_post',
        description: 'the blog post to update',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(ref: '#/components/schemas/BlogPostUpdateFormRequest')
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns the updated blog post',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/BlogPost', type: 'object'),
                ]
            )
        )
    )]
    public function update(BlogPostRequest $request, BlogPost $blogPost): JsonResponse
    {
        return parent::baseUpdate($request, $blogPost);
    }

    #[OA\Delete(
        path: '/api/admin/blog-posts/{blog_post}',
        description: 'delete a single blog post by id',
        summary: 'delete blog post',
        security: [['Bearer' => []]],
        tags: ['Admin Blog Post'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(
        name: 'blog_post',
        description: 'the blog post to delete',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns the deleted blog post',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/BlogPost', type: 'object'),
                ]
            )
        )
    )]
    public function destroy(BlogPost $blogPost): JsonResponse
    {
        return parent::baseDestroy($blogPost);
    }

    #[OA\Post(
        path: '/api/admin/blog-posts/bulk-delete',
        description: 'delete many blog posts in one request',
        summary: 'bulk delete blog posts',
        security: [['Bearer' => []]],
        tags: ['Admin Blog Post'],
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
        path: '/api/admin/blog-posts/export',
        description: 'download every blog post the current filters select as a csv file, translated fields in '
            . 'the language the x-locale header asks for. Takes the same filters as index(), without the paging.',
        summary: 'export blog posts as csv',
        security: [['Bearer' => []]],
        tags: ['Admin Blog Post'],
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
    public function export(BlogPostFilter $filter): StreamedResponse
    {
        return parent::baseExport($filter, 'blog-posts');
    }
}
