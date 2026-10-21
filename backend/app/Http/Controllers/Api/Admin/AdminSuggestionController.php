<?php

namespace App\Http\Controllers\Api\Admin;

use App\Constant\PermissionType;
use App\Constant\SerializedGroup;
use App\Http\Controllers\Api\ApiController;
use App\Http\QueryFilter\SuggestionFilter;
use App\Http\Requests\Admin\BulkDeleteRequest;
use App\Http\Requests\Admin\SuggestionAcceptRequest;
use App\Http\Requests\Admin\SuggestionRejectRequest;
use App\Http\Requests\Admin\SuggestionRequest;
use App\Http\Resources\SuggestionResource;
use App\Models\Suggestion;
use App\Services\SuggestionService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminSuggestionController extends ApiController
{
    public function __construct(protected SuggestionService $suggestionService)
    {
        $this->permissionPrefix = PermissionType::PermissionManageSuggestion->getSection();
        $this->resource = SuggestionResource::class;
        $this->service = $suggestionService;
        parent::__construct();

        // Accepting and rejecting are reviews of the record, the same permission that edits it.
        $this->middleware(["permission:MANAGE_$this->permissionPrefix|PERMISSION_UPDATE_$this->permissionPrefix"], ['only' => ['accept', 'reject']]);
    }

    #[OA\Get(
        path: '/api/admin/suggestions',
        description: 'get all suggestions, newest first',
        summary: 'get all suggestions',
        security: [['Bearer' => []]],
        tags: ['Admin Suggestion'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(ref: '#/components/parameters/direction')]
    #[OA\Parameter(
        name: 'sort',
        description: 'Specify sorting order.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', enum: ['id', 'status', 'created_at']),
        example: 'created_at'
    )]
    #[OA\Parameter(ref: '#/components/parameters/page')]
    #[OA\Parameter(ref: '#/components/parameters/limit')]
    #[OA\Parameter(name: 'search', description: 'Free text search on name / description / proposer name.', in: 'query', required: false, schema: new OA\Schema(type: 'string'))]
    #[OA\Parameter(name: 'type', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['place', 'coach', 'team', 'event']))]
    #[OA\Parameter(name: 'status', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['pending', 'accepted', 'rejected']))]
    #[OA\Parameter(name: 'areaId', in: 'query', required: false, schema: new OA\Schema(type: 'integer'))]
    #[OA\Response(
        response: 200,
        description: 'Return all suggestions',
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
                                    new OA\Property(property: 'items', type: 'array', items: new OA\Items(ref: '#/components/schemas/Suggestion')),
                                ],
                                type: 'object'
                            ),
                        ]
                    ),
                ]
            )
        )
    )]
    public function index(SuggestionFilter $filter): JsonResponse
    {
        return parent::baseIndex($filter);
    }

    #[OA\Get(
        path: '/api/admin/suggestions/{suggestion}',
        description: 'Fetches a single suggestion by id',
        summary: 'Get one suggestion',
        security: [['Bearer' => []]],
        tags: ['Admin Suggestion'],
    )]
    #[OA\Parameter(name: 'suggestion', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1)]
    #[OA\Response(
        response: 200,
        description: 'Returns one suggestion',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(properties: [
                new OA\Property(property: 'success', type: 'boolean', example: true),
                new OA\Property(property: 'data', ref: '#/components/schemas/Suggestion', type: 'object'),
            ])
        )
    )]
    public function show(Suggestion $suggestion): JsonResponse
    {
        return parent::baseShow($suggestion->load($this->service->getWithRelations()));
    }

    #[OA\Put(
        path: '/api/admin/suggestions/{suggestion}',
        description: 'Edit a pending suggestion before accepting it. An accepted or rejected one answers 422.',
        summary: 'Update suggestion',
        security: [['Bearer' => []]],
        tags: ['Admin Suggestion'],
    )]
    #[OA\Parameter(name: 'suggestion', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1)]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(ref: '#/components/schemas/SuggestionStoreFormRequest')
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns the updated suggestion',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(properties: [
                new OA\Property(property: 'success', type: 'boolean', example: true),
                new OA\Property(property: 'data', ref: '#/components/schemas/Suggestion', type: 'object'),
            ])
        )
    )]
    public function update(SuggestionRequest $request, Suggestion $suggestion): JsonResponse
    {
        return parent::baseUpdate($request, $suggestion);
    }

    #[OA\Post(
        path: '/api/admin/suggestions/{suggestion}/accept',
        description: 'Accept a pending suggestion. A place / coach / team becomes a directory entry, an event '
            .'becomes an event, built from the suggestion plus whatever overrides are sent. The new record id is '
            .'returned as promotedType / promotedId.',
        summary: 'Accept suggestion',
        security: [['Bearer' => []]],
        tags: ['Admin Suggestion'],
    )]
    #[OA\Parameter(name: 'suggestion', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1)]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(ref: '#/components/schemas/SuggestionAcceptFormRequest')
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns the accepted suggestion',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(properties: [
                new OA\Property(property: 'success', type: 'boolean', example: true),
                new OA\Property(property: 'data', ref: '#/components/schemas/Suggestion', type: 'object'),
            ])
        )
    )]
    public function accept(SuggestionAcceptRequest $request, Suggestion $suggestion): JsonResponse
    {
        $suggestion = $this->suggestionService->accept($suggestion, $request->validated(), $request->user());

        return $this
            ->setResourceClass($this->resource)
            ->setSerializedGroup(SerializedGroup::Details->value)
            ->successResponse($suggestion);
    }

    #[OA\Post(
        path: '/api/admin/suggestions/{suggestion}/reject',
        description: 'Reject a pending suggestion. The reason is required and kept on the record.',
        summary: 'Reject suggestion',
        security: [['Bearer' => []]],
        tags: ['Admin Suggestion'],
    )]
    #[OA\Parameter(name: 'suggestion', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1)]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(ref: '#/components/schemas/SuggestionRejectFormRequest')
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns the rejected suggestion',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(properties: [
                new OA\Property(property: 'success', type: 'boolean', example: true),
                new OA\Property(property: 'data', ref: '#/components/schemas/Suggestion', type: 'object'),
            ])
        )
    )]
    public function reject(SuggestionRejectRequest $request, Suggestion $suggestion): JsonResponse
    {
        $suggestion = $this->suggestionService->reject($suggestion, $request->validated()['reject_reason'], $request->user());

        return $this
            ->setResourceClass($this->resource)
            ->setSerializedGroup(SerializedGroup::Details->value)
            ->successResponse($suggestion);
    }

    #[OA\Delete(
        path: '/api/admin/suggestions/{suggestion}',
        description: 'delete a single suggestion by id. What an accepted one created stays.',
        summary: 'delete suggestion',
        security: [['Bearer' => []]],
        tags: ['Admin Suggestion'],
    )]
    #[OA\Parameter(name: 'suggestion', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), example: 1)]
    #[OA\Response(
        response: 200,
        description: 'Returns the deleted suggestion',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(properties: [
                new OA\Property(property: 'success', type: 'boolean', example: true),
                new OA\Property(property: 'data', ref: '#/components/schemas/Suggestion', type: 'object'),
            ])
        )
    )]
    public function destroy(Suggestion $suggestion): JsonResponse
    {
        return parent::baseDestroy($suggestion);
    }

    #[OA\Post(
        path: '/api/admin/suggestions/bulk-delete',
        description: 'delete many suggestions in one request',
        summary: 'bulk delete suggestions',
        security: [['Bearer' => []]],
        tags: ['Admin Suggestion'],
    )]
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
        path: '/api/admin/suggestions/export',
        description: 'download the suggestions the current filters select as a csv file',
        summary: 'export suggestions as csv',
        security: [['Bearer' => []]],
        tags: ['Admin Suggestion'],
    )]
    #[OA\Response(
        response: 200,
        description: 'The csv file, as a download',
        content: new OA\MediaType(mediaType: 'text/csv', schema: new OA\Schema(type: 'string', format: 'binary'))
    )]
    public function export(SuggestionFilter $filter): StreamedResponse
    {
        return parent::baseExport($filter, 'suggestions');
    }
}
