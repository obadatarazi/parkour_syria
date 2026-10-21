<?php

namespace App\Http\Controllers\Api\Admin;

use App\Constant\PermissionType;
use App\Http\Controllers\Api\ApiController;
use App\Http\QueryFilter\TagFilter;
use App\Http\Requests\Admin\BulkDeleteRequest;
use App\Http\Requests\Admin\TagRequest;
use App\Http\Resources\TagResource;
use App\Models\Tag;
use App\Services\TagService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminTagController extends ApiController
{
    public function __construct(protected TagService $tagService)
    {
        $this->permissionPrefix = PermissionType::PermissionManageTag->getSection();
        $this->resource = TagResource::class;
        $this->service = $tagService;
        parent::__construct();
    }

    #[OA\Get(
        path: '/api/admin/tags',
        description: 'get all list tags',
        summary: 'get all tags',
        security: [['Bearer' => []]],
        tags: ['Admin Tag'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(ref: "#/components/parameters/direction")]
    #[OA\Parameter(
        name: 'sort',
        description: 'Specify sorting order.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', enum: ['id', 'created_at', 'title']),
        example: 'created_at'
    )]
    #[OA\Parameter(ref: "#/components/parameters/page")]
    #[OA\Parameter(ref: "#/components/parameters/limit")]
    #[OA\Parameter(
        name: 'search',
        description: 'Apply filter by title.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Parameter(
        name: 'publish',
        description: 'Apply filter by publish tag.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'boolean')
    )]
    #[OA\Parameter(
        name: 'slug',
        description: 'Apply filter by tag slug.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Response(
        response: 200,
        description: 'Return All Tags',
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
                                        items: new OA\Items(ref: '#/components/schemas/Tag')
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
    public function index(TagFilter $tagFilter): JsonResponse
    {
        return parent::baseIndex($tagFilter);
    }

    /**
     * @throws \Exception
     */
    #[OA\Post(
        path: '/api/admin/tags',
        description: 'create new tag',
        summary: 'create tag',
        security: [['Bearer' => []]],
        tags: ['Admin Tag'],
        parameters: [new OA\Parameter(ref: "#/components/parameters/x-locale")],
    )]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(ref: '#/components/schemas/TagStoreFormRequest')
        )
    )]
    #[OA\Response(
        response: 201,
        description: 'Returns Created Tag',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Tag', type: 'object'),
                ]
            )
        )
    )]
    public function store(TagRequest $tagRequest): JsonResponse
    {
        return parent::baseStore($tagRequest);
    }

    #[OA\Get(
        path: '/api/admin/tags/{tag}',
        description: 'Fetches a single tag by id',
        summary: 'Get one tag',
        security: [['Bearer' => []]],
        tags: ['Admin Tag'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(
        name: 'tag',
        description: 'the tag to retrieve',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns Get One Tag',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Tag', type: 'object'),
                ]
            )
        )
    )]
    public function show(Tag $tag): JsonResponse
    {
        return parent::baseShow($tag);
    }

    #[OA\Put(
        path: '/api/admin/tags/{tag}',
        description: 'Update one tag',
        summary: 'Update tag',
        security: [['Bearer' => []]],
        tags: ['Admin Tag'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(
        name: 'tag',
        description: 'the tag to update',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(ref: '#/components/schemas/TagUpdateFormRequest')
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns Updated Tag',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Tag', type: 'object'),
                ]
            )
        )
    )]
    public function update(TagRequest $tagRequest, Tag $tag): JsonResponse
    {
        return parent::baseUpdate($tagRequest, $tag);
    }

    #[OA\Delete(
        path: '/api/admin/tags/{tag}',
        description: 'delete a single tag by id',
        summary: 'delete tag',
        security: [['Bearer' => []]],
        tags: ['Admin Tag'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(
        name: 'tag',
        description: 'the tag to delete',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns Deleted Tag',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Tag', type: 'object'),
                ]
            )
        )
    )]
    public function destroy(Tag $tag): JsonResponse
    {
        return parent::baseDestroy($tag);
    }

    #[OA\Post(
        path: '/api/admin/tags/bulk-delete',
        description: 'delete many tags in one request',
        summary: 'bulk delete tags',
        security: [['Bearer' => []]],
        tags: ['Admin Tag'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
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
        path: '/api/admin/tags/export',
        description: 'download every tags the current filters select as a csv file. The file carries all '
            . 'the columns of the record, its translated fields written in the language the x-locale header '
            . 'asks for, and the names behind its relations — a brand, a category, a product, never a bare '
            . 'id. It takes the same filters index() takes, without the paging.',
        summary: 'export tags as csv',
        security: [['Bearer' => []]],
        tags: ['Admin Tag'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Response(
        response: 200,
        description: 'The csv file, as a download',
        content: new OA\MediaType(
            mediaType: 'text/csv',
            schema: new OA\Schema(type: 'string', format: 'binary')
        )
    )]
    public function export(TagFilter $filter): StreamedResponse
    {
        return parent::baseExport($filter, 'tags');
    }
}
