<?php

namespace App\Http\Controllers\Api\Admin;

use App\Constant\PermissionType;
use App\Http\Controllers\Api\ApiController;
use App\Http\QueryFilter\PageFilter;
use App\Http\Requests\Admin\PageRequest;
use App\Http\Resources\PageResource;
use App\Models\Page;
use App\Services\PageService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminPageController extends ApiController
{
    public function __construct(protected PageService $pageService)
    {
        $this->permissionPrefix = PermissionType::PermissionManagePage->getSection();
        $this->resource = PageResource::class;
        $this->service = $pageService;
        parent::__construct();
    }

    #[OA\Get(
        path: '/api/admin/pages',
        description: 'get all pages, published or not',
        summary: 'get all pages',
        security: [['Bearer' => []]],
        tags: ['Admin Page'],
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
        name: 'publish',
        description: 'Filter by publish.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'boolean')
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
        description: 'Return all pages',
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
        return parent::baseIndex($filter);
    }

    #[OA\Get(
        path: '/api/admin/pages/{page}',
        description: 'Fetches a single page by id',
        summary: 'Get one page',
        security: [['Bearer' => []]],
        tags: ['Admin Page'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(
        name: 'page',
        description: 'the page to retrieve',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
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
    public function show(Page $page): JsonResponse
    {
        return parent::baseShow($page->load($this->service->getWithRelations()));
    }

    #[OA\Post(
        path: '/api/admin/pages/{page}',
        description: 'Update one page. Send it as multipart with _method=PUT when an image is attached.',
        summary: 'Update page',
        security: [['Bearer' => []]],
        tags: ['Admin Page'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(
        name: 'page',
        description: 'the page to update',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(ref: '#/components/schemas/PageUpdateFormRequest')
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns the updated page',
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
    public function update(PageRequest $request, Page $page): JsonResponse
    {
        return parent::baseUpdate($request, $page);
    }

    #[OA\Get(
        path: '/api/admin/pages/export',
        description: 'download every page the current filters select as a csv file, translated fields in '
            .'the language the x-locale header asks for. Takes the same filters as index(), without the paging.',
        summary: 'export pages as csv',
        security: [['Bearer' => []]],
        tags: ['Admin Page'],
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
    public function export(PageFilter $filter): StreamedResponse
    {
        return parent::baseExport($filter, 'pages');
    }
}
