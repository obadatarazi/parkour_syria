<?php

namespace App\Http\Controllers\Api;

use App\Constant\SerializedGroup;
use App\Http\QueryFilter\BrandFilter;
use App\Http\Resources\Website\BrandResource;
use App\Models\Brand;
use App\Services\BrandService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class BrandController extends ApiController
{
    public function __construct(protected BrandService $brandService)
    {
        $this->resource = BrandResource::class;
        $this->service = $brandService;
    }

    #[OA\Get(
        path: '/api/brands',
        description: 'get all list brands',
        summary: 'get all brands',
        tags: ['Brand'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(ref: "#/components/parameters/direction")]
    #[OA\Parameter(
        name: 'sort',
        description: 'Specify sorting order.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', enum: ['id', 'created_at', 'title']),
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
    #[OA\Response(
        response: 200,
        description: 'Return All Brands',
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
                                        items: new OA\Items(ref: '#/components/schemas/Brand')
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
    public function index(BrandFilter $brandFilter): JsonResponse
    {
        return parent::baseIndex($brandFilter, true);
    }

    #[OA\Get(
        path: '/api/brands/{brand}',
        description: 'Fetches a single brand by id',
        summary: 'Get one brand',
        tags: ['Brand'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(
        name: 'brand',
        description: 'the brand to retrieve',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns Get One Brand',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Brand', type: 'object'),
                ]
            )
        )
    )]
    public function show(Brand $brand): JsonResponse
    {
        return parent::baseShow($brand);
    }

    #[OA\Get(
        path: '/api/brands/slug/{slug}',
        description: 'Fetches a single brand by slug',
        summary: 'Get one brand by slug',
        tags: ['Brand'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(
        name: 'slug',
        description: 'the brand by slug to retrieve',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string'),
        example: 'title-brand'
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns Get One Brand By Slug',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Brand', type: 'object'),
                ]
            )
        )
    )]
    public function getBySlug($slug): JsonResponse
    {
        $data = $this->brandService->findBySlug($slug);

        return $this
            ->setResourceClass($this->resource)
            ->setSerializedGroup(SerializedGroup::Details->value)
            ->successResponse($data);
    }
}
