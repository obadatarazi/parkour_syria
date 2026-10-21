<?php

namespace App\Http\Controllers\Api;

use App\Http\QueryFilter\DirectoryEntryFilter;
use App\Http\Resources\Website\DirectoryEntryResource;
use App\Services\DirectoryEntryService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class DirectoryEntryController extends ApiController
{
    public function __construct(protected DirectoryEntryService $directoryEntryService)
    {
        $this->resource = DirectoryEntryResource::class;
        $this->service = $directoryEntryService;
    }

    #[OA\Get(
        path: '/api/directory-entries',
        description: 'get the directory entries the website shows (published only)',
        summary: 'get all directory entries',
        tags: ['Directory Entry'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(ref: '#/components/parameters/direction')]
    #[OA\Parameter(
        name: 'sort',
        description: 'Specify sorting order.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', enum: ['id', 'sort_order', 'created_at']),
        example: 'sort_order'
    )]
    #[OA\Parameter(ref: '#/components/parameters/page')]
    #[OA\Parameter(ref: '#/components/parameters/limit')]
    #[OA\Parameter(
        name: 'search',
        description: 'Free text search on name / description.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Parameter(
        name: 'verified',
        description: 'Filter by verified.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'boolean')
    )]
    #[OA\Parameter(
        name: 'type',
        description: 'Filter by type.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', enum: ['place', 'coach', 'team'])
    )]
    #[OA\Parameter(
        name: 'areaId',
        description: 'Filter by areaId.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\Parameter(
        name: 'area',
        description: 'Filter by the area slug.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Response(
        response: 200,
        description: 'Return all published directory entries',
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
                                        items: new OA\Items(ref: '#/components/schemas/DirectoryEntry')
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
    public function index(DirectoryEntryFilter $filter): JsonResponse
    {
        return parent::baseIndex($filter, true);
    }

    #[OA\Get(
        path: '/api/directory-entries/{slug}',
        description: 'Fetches a single published directory entry by its slug',
        summary: 'Get one directory entry',
        tags: ['Directory Entry'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(
        name: 'slug',
        description: 'the directory entry slug',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string'),
        example: 'tishreen-park'
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns one directory entry',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/DirectoryEntry', type: 'object'),
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
