<?php

namespace App\Http\Controllers\Api;

use App\Constant\SerializedGroup;
use App\Http\QueryFilter\TagFilter;
use App\Http\Resources\Website\TagResource;
use App\Models\Tag;
use App\Services\TagService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class TagController extends ApiController
{
    public function __construct(protected TagService $tagService)
    {
        $this->resource = TagResource::class;
        $this->service = $tagService;
    }

    #[OA\Get(
        path: '/api/tags',
        description: 'get all list tags',
        summary: 'get all tags',
        tags: ['Tag'],
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
        name: 'slug',
        description: 'Apply filter by tag slug.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Response(
        response: 200,
        description: 'Return All Tags',
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
                                        items: new OA\Items(ref: '#/components/schemas/Tag')
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
    public function index(TagFilter $tagFilter): JsonResponse
    {
        return parent::baseIndex($tagFilter, true);
    }

    #[OA\Get(
        path: '/api/tags/{tag}',
        description: 'Fetches a single tag by id',
        summary: 'Get one tag',
        tags: ['Tag'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(
        name: 'tag',
        description: 'the tag to retrieve',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns Get One Tag',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Tag', type: 'object'),
                ]
            )
        )
    )]
    public function show(Tag $tag): JsonResponse
    {
        return parent::baseShow($tag);
    }

    #[OA\Get(
        path: '/api/tags/slug/{slug}',
        description: 'Fetches a single tag by slug',
        summary: 'Get one tag by slug',
        tags: ['Tag'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(
        name: 'slug',
        description: 'the tag by slug to retrieve',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string'),
        example: 'skincare'
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns Get One Tag By Slug',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Tag', type: 'object'),
                ]
            )
        )
    )]
    public function getBySlug($slug): JsonResponse
    {
        $data = $this->tagService->findBySlug($slug);

        return $this
            ->setResourceClass($this->resource)
            ->setSerializedGroup(SerializedGroup::Details->value)
            ->successResponse($data);
    }
}
