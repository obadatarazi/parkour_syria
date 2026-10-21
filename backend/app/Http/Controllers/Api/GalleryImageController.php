<?php

namespace App\Http\Controllers\Api;

use App\Http\QueryFilter\GalleryImageFilter;
use App\Http\Resources\Website\GalleryImageResource;
use App\Services\GalleryImageService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class GalleryImageController extends ApiController
{
    public function __construct(protected GalleryImageService $galleryImageService)
    {
        $this->resource = GalleryImageResource::class;
        $this->service = $galleryImageService;
    }

    #[OA\Get(
        path: '/api/gallery-images',
        description: 'get the gallery images the website shows (published only)',
        summary: 'get all gallery images',
        tags: ['Gallery Image'],
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
        description: 'Free text search on caption.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Response(
        response: 200,
        description: 'Return all published gallery images',
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
                                        items: new OA\Items(ref: '#/components/schemas/GalleryImage')
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
    public function index(GalleryImageFilter $filter): JsonResponse
    {
        return parent::baseIndex($filter, true);
    }

    #[OA\Get(
        path: '/api/gallery-images/{id}',
        description: 'Fetches a single published gallery image',
        summary: 'Get one gallery image',
        tags: ['Gallery Image'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(
        name: 'id',
        description: 'the gallery image to retrieve',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns one gallery image',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/GalleryImage', type: 'object'),
                ]
            )
        )
    )]
    public function show(int $id): JsonResponse
    {
        return parent::baseShow($this->service->findPublishedBy('id', $id));
    }
}
