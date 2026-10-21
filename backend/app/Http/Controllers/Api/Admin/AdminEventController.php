<?php

namespace App\Http\Controllers\Api\Admin;

use App\Constant\PermissionType;
use App\Http\Controllers\Api\ApiController;
use App\Http\QueryFilter\EventFilter;
use App\Http\Requests\Admin\BulkDeleteRequest;
use App\Http\Requests\Admin\EventRequest;
use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Services\EventService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminEventController extends ApiController
{
    public function __construct(protected EventService $eventService)
    {
        $this->permissionPrefix = PermissionType::PermissionManageEvent->getSection();
        $this->resource = EventResource::class;
        $this->service = $eventService;
        parent::__construct();
    }

    #[OA\Get(
        path: '/api/admin/events',
        description: 'get all events, published or not',
        summary: 'get all events',
        security: [['Bearer' => []]],
        tags: ['Admin Event'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(ref: '#/components/parameters/direction')]
    #[OA\Parameter(
        name: 'sort',
        description: 'Specify sorting order.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', enum: ['id', 'starts_at', 'created_at']),
        example: 'starts_at'
    )]
    #[OA\Parameter(ref: '#/components/parameters/page')]
    #[OA\Parameter(ref: '#/components/parameters/limit')]
    #[OA\Parameter(
        name: 'search',
        description: 'Free text search on title / location_label.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Parameter(
        name: 'publish',
        description: 'Filter by publish.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'boolean')
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
    #[OA\Parameter(
        name: 'upcoming',
        description: 'Only events that have not started yet.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'boolean')
    )]
    #[OA\Response(
        response: 200,
        description: 'Return all events',
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
        return parent::baseIndex($filter);
    }

    #[OA\Post(
        path: '/api/admin/events',
        description: 'create a event',
        summary: 'create event',
        security: [['Bearer' => []]],
        tags: ['Admin Event'],
        parameters: [new OA\Parameter(ref: '#/components/parameters/x-locale')],
    )]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(ref: '#/components/schemas/EventStoreFormRequest')
        )
    )]
    #[OA\Response(
        response: 201,
        description: 'Returns the created event',
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
    public function store(EventRequest $request): JsonResponse
    {
        return parent::baseStore($request);
    }

    #[OA\Get(
        path: '/api/admin/events/{event}',
        description: 'Fetches a single event by id',
        summary: 'Get one event',
        security: [['Bearer' => []]],
        tags: ['Admin Event'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(
        name: 'event',
        description: 'the event to retrieve',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
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
    public function show(Event $event): JsonResponse
    {
        return parent::baseShow($event->load($this->service->getWithRelations()));
    }

    #[OA\Post(
        path: '/api/admin/events/{event}',
        description: 'Update one event. Send it as multipart with _method=PUT when an image is attached.',
        summary: 'Update event',
        security: [['Bearer' => []]],
        tags: ['Admin Event'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(
        name: 'event',
        description: 'the event to update',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(ref: '#/components/schemas/EventUpdateFormRequest')
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns the updated event',
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
    public function update(EventRequest $request, Event $event): JsonResponse
    {
        return parent::baseUpdate($request, $event);
    }

    #[OA\Delete(
        path: '/api/admin/events/{event}',
        description: 'delete a single event by id',
        summary: 'delete event',
        security: [['Bearer' => []]],
        tags: ['Admin Event'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(
        name: 'event',
        description: 'the event to delete',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns the deleted event',
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
    public function destroy(Event $event): JsonResponse
    {
        return parent::baseDestroy($event);
    }

    #[OA\Post(
        path: '/api/admin/events/bulk-delete',
        description: 'delete many events in one request',
        summary: 'bulk delete events',
        security: [['Bearer' => []]],
        tags: ['Admin Event'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(ref: '#/components/schemas/BulkDeleteFormRequest')
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns the outcome of the bulk delete',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(ref: '#/components/schemas/BulkDeleteResult')
        )
    )]
    public function bulkDestroy(BulkDeleteRequest $bulkDeleteRequest): JsonResponse
    {
        return parent::baseBulkDestroy($bulkDeleteRequest);
    }

    #[OA\Get(
        path: '/api/admin/events/export',
        description: 'download every event the current filters select as a csv file, translated fields in '
            .'the language the x-locale header asks for. Takes the same filters as index(), without the paging.',
        summary: 'export events as csv',
        security: [['Bearer' => []]],
        tags: ['Admin Event'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Response(
        response: 200,
        description: 'The csv file, as a download',
        content: new OA\MediaType(
            mediaType: 'text/csv',
            schema: new OA\Schema(type: 'string', format: 'binary')
        )
    )]
    public function export(EventFilter $filter): StreamedResponse
    {
        return parent::baseExport($filter, 'events');
    }
}
