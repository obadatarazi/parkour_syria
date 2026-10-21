<?php

namespace App\Http\Controllers\Api;

use App\Http\QueryFilter\LessonFilter;
use App\Http\Resources\Website\LessonResource;
use App\Services\LessonService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class LessonController extends ApiController
{
    public function __construct(protected LessonService $lessonService)
    {
        $this->resource = LessonResource::class;
        $this->service = $lessonService;
    }

    #[OA\Get(
        path: '/api/lessons',
        description: 'get the lessons the website shows (published only)',
        summary: 'get all lessons',
        tags: ['Lesson'],
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
        description: 'Return all published lessons',
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
                                        items: new OA\Items(ref: '#/components/schemas/Lesson')
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
    public function index(LessonFilter $filter): JsonResponse
    {
        return parent::baseIndex($filter, true);
    }

    #[OA\Get(
        path: '/api/lessons/{slug}',
        description: 'Fetches a single published lesson by its slug',
        summary: 'Get one lesson',
        tags: ['Lesson'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(
        name: 'slug',
        description: 'the lesson slug',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string'),
        example: 'safety-first'
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns one lesson',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Lesson', type: 'object'),
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
