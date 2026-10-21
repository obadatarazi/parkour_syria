<?php

namespace App\Http\Controllers\Api;

use App\Http\QueryFilter\AreaFilter;
use App\Http\Resources\Website\AreaResource;
use App\Services\AreaService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class AreaController extends ApiController
{
    public function __construct(protected AreaService $areaService)
    {
        $this->resource = AreaResource::class;
        $this->service = $areaService;
    }

    #[OA\Get(
        path: '/api/areas',
        description: 'get the areas the website shows (published only)',
        summary: 'get all areas',
        tags: ['Area'],
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
    #[OA\Response(
        response: 200,
        description: 'Return all published areas',
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
        return parent::baseIndex($filter, true);
    }

    #[OA\Get(
        path: '/api/areas/{slug}',
        description: 'Fetches a single published area by its slug',
        summary: 'Get one area',
        tags: ['Area'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(
        name: 'slug',
        description: 'the area slug',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string'),
        example: 'mazzeh'
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
    public function show(string $slug): JsonResponse
    {
        $object = $this->service->findPublishedBy('slug', $slug);

        return parent::baseShow($object);
    }
}
