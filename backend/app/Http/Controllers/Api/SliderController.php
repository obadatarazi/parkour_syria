<?php

namespace App\Http\Controllers\Api;

use App\Http\QueryFilter\SliderFilter;
use App\Http\Resources\Website\SliderResource;
use App\Services\SliderService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class SliderController extends ApiController
{
    public function __construct(protected SliderService $sliderService)
    {
        $this->resource = SliderResource::class;
        $this->service = $sliderService;
    }

    #[OA\Get(
        path: '/api/sliders',
        description: 'get the sliders the website shows (published only)',
        summary: 'get all sliders',
        tags: ['Slider'],
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
        description: 'Free text search on badge / title.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Response(
        response: 200,
        description: 'Return all published sliders',
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
                                        items: new OA\Items(ref: '#/components/schemas/Slider')
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
    public function index(SliderFilter $filter): JsonResponse
    {
        return parent::baseIndex($filter, true);
    }

    #[OA\Get(
        path: '/api/sliders/{id}',
        description: 'Fetches a single published slider',
        summary: 'Get one slider',
        tags: ['Slider'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(
        name: 'id',
        description: 'the slider to retrieve',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns one slider',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Slider', type: 'object'),
                ]
            )
        )
    )]
    public function show(int $id): JsonResponse
    {
        return parent::baseShow($this->service->findPublishedBy('id', $id));
    }
}
