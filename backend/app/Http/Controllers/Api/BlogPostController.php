<?php

namespace App\Http\Controllers\Api;

use App\Http\QueryFilter\BlogPostFilter;
use App\Http\Resources\Website\BlogPostResource;
use App\Services\BlogPostService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class BlogPostController extends ApiController
{
    public function __construct(protected BlogPostService $blogPostService)
    {
        $this->resource = BlogPostResource::class;
        $this->service = $blogPostService;
    }

    #[OA\Get(
        path: '/api/blog-posts',
        description: 'get the blog posts the website shows (published only)',
        summary: 'get all blog posts',
        tags: ['Blog Post'],
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
        description: 'Return all published blog posts',
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
        return parent::baseIndex($filter, true);
    }

    #[OA\Get(
        path: '/api/blog-posts/{slug}',
        description: 'Fetches a single published blog post by its slug',
        summary: 'Get one blog post',
        tags: ['Blog Post'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(
        name: 'slug',
        description: 'the blog post slug',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string'),
        example: 'safety-rules'
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
    public function show(string $slug): JsonResponse
    {
        $object = $this->service->findPublishedBy('slug', $slug);

        return parent::baseShow($object);
    }
}
