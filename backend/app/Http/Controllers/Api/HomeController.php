<?php

namespace App\Http\Controllers\Api;

use App\Constant\SerializedGroup;
use App\Http\Resources\Website\HomeCmsResource;
use App\Services\HomeCmsService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class HomeController extends ApiController
{
    public function __construct(protected HomeCmsService $homeCmsService) {}

    #[OA\Get(
        path: '/api/home',
        description: 'Everything the home page draws in one request: the hero sliders, the latest blog posts, '
            .'the upcoming events, a slice of verified directory entries, the gallery and the `home` page copy. Published '
            .'content only, cached for 90 seconds per locale and flushed whenever one of the rails is edited.',
        summary: 'home page payload',
        tags: ['Home'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Response(
        response: 200,
        description: 'The home payload',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(properties: [
                new OA\Property(property: 'success', type: 'boolean', example: true),
                new OA\Property(property: 'data', ref: '#/components/schemas/HomeCms', type: 'object'),
            ])
        )
    )]
    public function home(): JsonResponse
    {
        return $this
            ->setResourceClass(HomeCmsResource::class)
            ->setSerializedGroup(SerializedGroup::List->value)
            ->successResponse($this->homeCmsService->getHomePayload());
    }
}
