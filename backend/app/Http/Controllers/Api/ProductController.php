<?php

namespace App\Http\Controllers\Api;

use App\Http\QueryFilter\ProductFilter;
use App\Http\Resources\Website\ProductResource;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class ProductController extends ApiController
{
    public function __construct(protected ProductService $productService)
    {
        $this->resource = ProductResource::class;
        $this->service = $productService;
    }

    #[OA\Get(
        path: '/api/products',
        description: 'get the products the website shows (published only)',
        summary: 'get all products',
        tags: ['Product'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(ref: "#/components/parameters/direction")]
    #[OA\Parameter(
        name: 'sort',
        description: 'Specify sorting order.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', enum: ['id', 'price', 'created_at']),
        example: 'price'
    )]
    #[OA\Parameter(ref: "#/components/parameters/page")]
    #[OA\Parameter(ref: "#/components/parameters/limit")]
    #[OA\Parameter(
        name: 'search',
        description: 'Free text search on title / slug / sku_code.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Parameter(
        name: 'brandId',
        description: 'Filter by brandId.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\Parameter(
        name: 'categoryId',
        description: 'Filter by categoryId.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\Response(
        response: 200,
        description: 'Return all published products',
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
                                        items: new OA\Items(ref: '#/components/schemas/Product')
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
    public function index(ProductFilter $filter): JsonResponse
    {
        return parent::baseIndex($filter, true);
    }

    #[OA\Get(
        path: '/api/products/{slug}',
        description: 'Fetches a single published product by its slug',
        summary: 'Get one product',
        tags: ['Product'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(
        name: 'slug',
        description: 'the product slug',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string'),
        example: 'parkour-book'
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns one product',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Product', type: 'object'),
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
