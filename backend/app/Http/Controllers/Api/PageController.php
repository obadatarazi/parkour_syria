<?php

namespace App\Http\Controllers\Api;

use App\Http\QueryFilter\PageFilter;
use App\Http\Resources\Website\PageResource;
use App\Services\PageService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class PageController extends ApiController
{
    public function __construct(protected PageService $pageService)
    {
        $this->resource = PageResource::class;
        $this->service = $pageService;
    }

    #[OA\Get(
        path: '/api/pages',
        description: 'get the pages the website shows (published only)',
        summary: 'get all pages',
        tags: ['Page'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(ref: '#/components/parameters/direction')]
    #[OA\Parameter(
        name: 'sort',
        description: 'Specify sorting order.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', enum: ['id', 'key', 'created_at']),
        example: 'key'
    )]
    #[OA\Parameter(ref: '#/components/parameters/page')]
    #[OA\Parameter(ref: '#/components/parameters/limit')]
    #[OA\Parameter(
        name: 'search',
        description: 'Free text search on title / key.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Parameter(
        name: 'key',
        description: 'Filter by key.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Response(
        response: 200,
        description: 'Return all published pages',
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
                                        items: new OA\Items(ref: '#/components/schemas/Page')
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
    public function index(PageFilter $filter): JsonResponse
    {
        return parent::baseIndex($filter, true);
    }

    #[OA\Get(
        path: '/api/pages/{key}',
        description: 'Fetches a single published page by its key',
        summary: 'Get one page',
        tags: ['Page'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(
        name: 'key',
        description: 'the page key',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string'),
        example: 'about'
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns one page',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Page', type: 'object'),
                ]
            )
        )
    )]
    public function show(string $key): JsonResponse
    {
        $object = $this->service->findPublishedBy('key', $key);

        return parent::baseShow($object);
    }
}
