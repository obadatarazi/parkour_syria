<?php

namespace App\Http\Controllers\Api\Admin;

use App\Constant\PermissionType;
use App\Http\Controllers\Api\ApiController;
use App\Http\QueryFilter\CurrencyFilter;
use App\Http\Requests\Admin\BulkDeleteRequest;
use App\Http\Requests\Admin\CurrencyRequest;
use App\Http\Resources\CurrencyResource;
use App\Models\Currency;
use App\Services\CurrencyService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminCurrencyController extends ApiController
{
    public function __construct(protected CurrencyService $currencyService)
    {
        $this->permissionPrefix = PermissionType::PermissionManageCurrency->getSection();
        $this->resource = CurrencyResource::class;
        $this->service = $currencyService;
        parent::__construct();
    }

    #[OA\Get(
        path: '/api/admin/currencies',
        description: 'get all list currencies',
        summary: 'get all currencies',
        security: [['Bearer' => []]],
        tags: ['Admin Currency'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(ref: "#/components/parameters/direction")]
    #[OA\Parameter(
        name: 'sort',
        description: 'Specify sorting order.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', enum: ['id', 'created_at', 'title', 'code']),
        example: 'created_at'
    )]
    #[OA\Parameter(ref: "#/components/parameters/page")]
    #[OA\Parameter(ref: "#/components/parameters/limit")]
    #[OA\Parameter(
        name: 'search',
        description: 'Apply filter by title currency.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Parameter(
        name: 'code',
        description: 'Apply filter by code currency.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Parameter(
        name: 'publish',
        description: 'Apply filter by publish currency.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'boolean')
    )]
    #[OA\Parameter(
        name: 'isDefault',
        description: 'Apply filter by default currency.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'boolean')
    )]
    #[OA\Response(
        response: 200,
        description: 'Return All Currencies',
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
                                        items: new OA\Items(ref: '#/components/schemas/Currency')
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
    public function index(CurrencyFilter $currencyFilter): JsonResponse
    {
        return parent::baseIndex($currencyFilter);
    }

    #[OA\Post(
        path: '/api/admin/currencies',
        description: 'create new currency',
        summary: 'create currency',
        security: [['Bearer' => []]],
        tags: ['Admin Currency'],
        parameters: [new OA\Parameter(ref: "#/components/parameters/x-locale")],
    )]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(ref: '#/components/schemas/CurrencyFormRequest')
        )
    )]
    #[OA\Response(
        response: 201,
        description: 'Returns Created Currency',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Currency', type: 'object'),
                ]
            )
        )
    )]
    public function store(CurrencyRequest $currencyRequest): JsonResponse
    {
        return parent::baseStore($currencyRequest);
    }

    #[OA\Get(
        path: '/api/admin/currencies/{currency}',
        description: 'Fetches a single currency by id',
        summary: 'Get one currency',
        security: [['Bearer' => []]],
        tags: ['Admin Currency'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(
        name: 'currency',
        description: 'the currency to retrieve',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns Get One Currency',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Currency', type: 'object'),
                ]
            )
        )
    )]
    public function show(Currency $currency): JsonResponse
    {
        return parent::baseShow($currency);
    }

    #[OA\Put(
        path: '/api/admin/currencies/{currency}',
        description: 'Update one currency',
        summary: 'Update currency',
        security: [['Bearer' => []]],
        tags: ['Admin Currency'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(
        name: 'currency',
        description: 'the currency to update',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(ref: '#/components/schemas/CurrencyFormRequest')
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns Updated Currency',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Currency', type: 'object'),
                ]
            )
        )
    )]
    public function update(CurrencyRequest $currencyRequest, Currency $currency): JsonResponse
    {
        return parent::baseUpdate($currencyRequest, $currency);
    }

    #[OA\Delete(
        path: '/api/admin/currencies/{currency}',
        description: 'delete a single currency by id, the default currency can not be deleted',
        summary: 'delete currency',
        security: [['Bearer' => []]],
        tags: ['Admin Currency'],
    )]
    #[OA\Parameter(ref: "#/components/parameters/x-locale")]
    #[OA\Parameter(
        name: 'currency',
        description: 'the currency to delete',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns Deleted Currency',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/Currency', type: 'object'),
                ]
            )
        )
    )]
    public function destroy(Currency $currency): JsonResponse
    {
        return parent::baseDestroy($currency);
    }

    #[OA\Post(
        path: '/api/admin/currencies/bulk-delete',
        description: 'delete many currencies in one request',
        summary: 'bulk delete currencies',
        security: [['Bearer' => []]],
        tags: ['Admin Currency'],
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
        path: '/api/admin/currencies/export',
        description: 'download every currencies the current filters select as a csv file. The file carries all '
            . 'the columns of the record, its translated fields written in the language the x-locale header '
            . 'asks for, and the names behind its relations — a brand, a category, a product, never a bare '
            . 'id. It takes the same filters index() takes, without the paging.',
        summary: 'export currencies as csv',
        security: [['Bearer' => []]],
        tags: ['Admin Currency'],
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
    public function export(CurrencyFilter $filter): StreamedResponse
    {
        return parent::baseExport($filter, 'currencies');
    }
}
