<?php

namespace App\Http\Controllers\Api;

use App\Http\QueryFilter\EventFilter;
use App\Http\Resources\Website\EventResource;
use App\Services\EventService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class EventController extends ApiController
{
    public function __construct(protected EventService $eventService)
    {
        $this->resource = EventResource::class;
        $this->service = $eventService;
    }

    #[OA\Get(
        path: '/api/events',
        description: 'get the events the website shows (published only)',
        summary: 'get all events',
        tags: ['Event'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(ref: "#/components/parameters/direction")]
    #[OA\Parameter(
        name: 'sort',
        description: 'Specify sorting order.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', enum: ['id', 'starts_at', 'created_at']),
        example: 'starts_at'
    )]
    #[OA\Parameter(ref: "#/components/parameters/page")]
    #[OA\Parameter(ref: "#/components/parameters/limit")]
    #[OA\Parameter(
        name: 'search',
        description: 'Free text search on title / location_label.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Parameter(
        name: 'type',
        description: 'Filter by type.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', enum: ['workshop', 'gathering'])
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
        description: 'Return all published events',
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
                                        items: new OA\Items(ref: '#/components/schemas/Event')
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
    public function index(EventFilter $filter): JsonResponse
    {
        // A past event is never shown, whatever the caller asks for.
        $filter->setFilter('upcoming', true);

        return parent::baseIndex($filter, true);
    }

    #[OA\Get(
        path: '/api/events/{slug}',
        description: 'Fetches a single published event by its slug',
        summary: 'Get one event',
        tags: ['Event'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(
        name: 'slug',
        description: 'the event slug',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string'),
        example: 'safety-workshop'
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns one event',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Event', type: 'object'),
                ]
            )
        )
    )]
    public function show(string $slug): JsonResponse
    {
        $object = $this->service->findPublishedBy('slug', $slug);

        // The detail of an event that already started answers like one that does not exist.
        abort_if($object->starts_at->isPast(), 404, __('exceptions.not_found'));

        return parent::baseShow($object);
    }
}
