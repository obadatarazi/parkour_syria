<?php

namespace App\Http\Controllers\Api\Admin;

use App\Constant\PermissionType;
use App\Http\Controllers\Api\ApiController;
use App\Http\QueryFilter\LessonFilter;
use App\Http\Requests\Admin\BulkDeleteRequest;
use App\Http\Requests\Admin\LessonRequest;
use App\Http\Resources\LessonResource;
use App\Models\Lesson;
use App\Services\LessonService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminLessonController extends ApiController
{
    public function __construct(protected LessonService $lessonService)
    {
        $this->permissionPrefix = PermissionType::PermissionManageLesson->getSection();
        $this->resource = LessonResource::class;
        $this->service = $lessonService;
        parent::__construct();
    }

    #[OA\Get(
        path: '/api/admin/lessons',
        description: 'get all lessons, published or not',
        summary: 'get all lessons',
        security: [['Bearer' => []]],
        tags: ['Admin Lesson'],
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
        description: 'Free text search on title / slug.',
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
    #[OA\Response(
        response: 200,
        description: 'Return all lessons',
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
                                        items: new OA\Items(ref: '#/components/schemas/Lesson')
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
    public function index(LessonFilter $filter): JsonResponse
    {
        return parent::baseIndex($filter);
    }

    #[OA\Post(
        path: '/api/admin/lessons',
        description: 'create a lesson',
        summary: 'create lesson',
        security: [['Bearer' => []]],
        tags: ['Admin Lesson'],
        parameters: [new OA\Parameter(ref: '#/components/parameters/x-locale')],
    )]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(ref: '#/components/schemas/LessonStoreFormRequest')
        )
    )]
    #[OA\Response(
        response: 201,
        description: 'Returns the created lesson',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Lesson', type: 'object'),
                ]
            )
        )
    )]
    public function store(LessonRequest $request): JsonResponse
    {
        return parent::baseStore($request);
    }

    #[OA\Get(
        path: '/api/admin/lessons/{lesson}',
        description: 'Fetches a single lesson by id',
        summary: 'Get one lesson',
        security: [['Bearer' => []]],
        tags: ['Admin Lesson'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(
        name: 'lesson',
        description: 'the lesson to retrieve',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns one lesson',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Lesson', type: 'object'),
                ]
            )
        )
    )]
    public function show(Lesson $lesson): JsonResponse
    {
        return parent::baseShow($lesson->load($this->service->getWithRelations()));
    }

    #[OA\Post(
        path: '/api/admin/lessons/{lesson}',
        description: 'Update one lesson. Send it as multipart with _method=PUT when an image is attached.',
        summary: 'Update lesson',
        security: [['Bearer' => []]],
        tags: ['Admin Lesson'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(
        name: 'lesson',
        description: 'the lesson to update',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(ref: '#/components/schemas/LessonUpdateFormRequest')
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns the updated lesson',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Lesson', type: 'object'),
                ]
            )
        )
    )]
    public function update(LessonRequest $request, Lesson $lesson): JsonResponse
    {
        return parent::baseUpdate($request, $lesson);
    }

    #[OA\Delete(
        path: '/api/admin/lessons/{lesson}',
        description: 'delete a single lesson by id',
        summary: 'delete lesson',
        security: [['Bearer' => []]],
        tags: ['Admin Lesson'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(
        name: 'lesson',
        description: 'the lesson to delete',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns the deleted lesson',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Lesson', type: 'object'),
                ]
            )
        )
    )]
    public function destroy(Lesson $lesson): JsonResponse
    {
        return parent::baseDestroy($lesson);
    }

    #[OA\Post(
        path: '/api/admin/lessons/bulk-delete',
        description: 'delete many lessons in one request',
        summary: 'bulk delete lessons',
        security: [['Bearer' => []]],
        tags: ['Admin Lesson'],
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
        path: '/api/admin/lessons/export',
        description: 'download every lesson the current filters select as a csv file, translated fields in '
            .'the language the x-locale header asks for. Takes the same filters as index(), without the paging.',
        summary: 'export lessons as csv',
        security: [['Bearer' => []]],
        tags: ['Admin Lesson'],
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
    public function export(LessonFilter $filter): StreamedResponse
    {
        return parent::baseExport($filter, 'lessons');
    }
}
