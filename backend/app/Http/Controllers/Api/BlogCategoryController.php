<?php

namespace App\Http\Controllers\Api;

use App\Http\QueryFilter\BlogCategoryFilter;
use App\Http\Resources\Website\BlogCategoryResource;
use App\Services\BlogCategoryService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class BlogCategoryController extends ApiController
{
    public function __construct(protected BlogCategoryService $blogCategoryService)
    {
        $this->resource = BlogCategoryResource::class;
        $this->service = $blogCategoryService;
    }

    #[OA\Get(
        path: '/api/blog-categories',
        description: 'get the blog categories the website shows (published only)',
        summary: 'get all blog categories',
        tags: ['Blog Category'],
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
        description: 'Free text search on title / slug.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Response(
        response: 200,
        description: 'Return all published blog categories',
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
        return parent::baseIndex($filter, true);
    }

    #[OA\Get(
        path: '/api/blog-categories/{slug}',
        description: 'Fetches a single published blog category by its slug',
        summary: 'Get one blog category',
        tags: ['Blog Category'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(
        name: 'slug',
        description: 'the blog category slug',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string'),
        example: 'safety'
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
    public function show(string $slug): JsonResponse
    {
        $object = $this->service->findPublishedBy('slug', $slug);

        return parent::baseShow($object);
    }
}
