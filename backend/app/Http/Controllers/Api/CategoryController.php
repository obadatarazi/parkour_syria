<?php

namespace App\Http\Controllers\Api;

use App\Constant\SerializedGroup;
use App\Http\QueryFilter\CategoryFilter;
use App\Http\Resources\Website\CategoryResource;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class CategoryController extends ApiController
{
    public function __construct(protected CategoryService $categoryService)
    {
        $this->resource = CategoryResource::class;
        $this->service = $categoryService;
    }

    #[OA\Get(
        path: '/api/categories',
        description: 'get all list categories',
        summary: 'get all categories',
        tags: ['Category'],
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
        name: 'showMenu',
        description: 'Apply filter by show menu category.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'boolean')
    )]
    #[OA\Parameter(
        name: 'showInHomePage',
        description: 'Apply filter by show in home page category.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'boolean')
    )]
    #[OA\Parameter(
        name: 'feature',
        description: 'Apply filter by feature category.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'boolean')
    )]
    #[OA\Parameter(
        name: 'parentCategoryId',
        description: 'Apply filter by parent category id.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\Parameter(
        name: 'depth',
        description: 'Apply filter by category depth level (0 = root).',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'integer', minimum: 0)
    )]
    #[OA\Parameter(
        name: 'rootOnly',
        description: 'Return only root categories (without parent).',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'boolean')
    )]
    #[OA\Response(
        response: 200,
        description: 'Return Paginated Categories As Tree',
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
                                        items: new OA\Items(ref: '#/components/schemas/Category')
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
    public function index(CategoryFilter $categoryFilter): JsonResponse
    {
        return parent::baseIndex($categoryFilter, true);
    }

    #[OA\Get(
        path: '/api/categories/{category}',
        description: 'Fetches a single category by id',
        summary: 'Get one category',
        tags: ['Category'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(
        name: 'category',
        description: 'the category to retrieve',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns Get One Category',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Category', type: 'object'),
                ]
            )
        )
    )]
    public function show(Category $category): JsonResponse
    {
        return parent::baseShow($category);
    }

    #[OA\Get(
        path: '/api/categories/slug/{slug}',
        description: 'Fetches a single category by slug',
        summary: 'Get one category by slug',
        tags: ['Category'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(
        name: 'slug',
        description: 'the category by slug to retrieve',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string'),
        example: 'title-category'
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns Get One Category By Slug',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Category', type: 'object'),
                ]
            )
        )
    )]
    public function getBySlug($slug): JsonResponse
    {
        $data = $this->categoryService->findBySlug($slug);

        return $this
            ->setResourceClass($this->resource)
            ->setSerializedGroup(SerializedGroup::Details->value)
            ->successResponse($data);
    }
}
