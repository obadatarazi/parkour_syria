<?php

namespace App\Http\Controllers\Api\Admin;

use App\Constant\PermissionType;
use App\Constant\SerializedGroup;
use App\Http\Controllers\Api\ApiController;
use App\Http\QueryFilter\MultiTypeSettingFilter;
use App\Http\Requests\Admin\MultiTypeSettingRequest;
use App\Http\Resources\MultiTypeSettingResource;
use App\Models\MultiTypeSetting;
use App\Services\MultiTypeSettingService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminMultiTypeSettingController extends ApiController
{
    public function __construct(protected MultiTypeSettingService $multiTypeSettingService)
    {
        $this->permissionPrefix = PermissionType::PermissionManageMultiTypeSetting->getSection();
        $this->resource = MultiTypeSettingResource::class;
        $this->service = $multiTypeSettingService;
        parent::__construct();
    }

    #[OA\Get(
        path: '/api/admin/multi-type-settings',
        description: 'get all list multi type setting',
        summary: 'get all multi type setting',
        security: [['Bearer' => []]],
        tags: ['Admin Multi Type Setting'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(ref: '#/components/parameters/direction')]
    #[OA\Parameter(
        name: 'sort',
        description: 'Specify sorting order.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', enum: ['id', 'created_at', 'type', 'setting_key']),
        example: 'created_at'
    )]
    #[OA\Parameter(ref: '#/components/parameters/page')]
    #[OA\Parameter(ref: '#/components/parameters/limit')]
    #[OA\Parameter(
        name: 'sort',
        description: 'Specify sorting order.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', enum: ['id', 'setting_key', 'type', 'created_at']),
        example: 'id'
    )]
    #[OA\Parameter(
        name: 'search',
        description: 'Apply filter by user name.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Parameter(
        name: 'type',
        description: 'Apply filter by type.',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'string', enum: ['EMAIL', 'LINK', 'NUMBER', 'PHONE_NUMBER', 'TEXT']),
    )]
    #[OA\Response(
        response: 200,
        description: 'Return All Multi Type Settings',
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
                                        items: new OA\Items(ref: '#/components/schemas/MultiTypeSetting')
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
    public function index(MultiTypeSettingFilter $multiTypeSettingFilter): JsonResponse
    {
        return parent::baseIndex($multiTypeSettingFilter);
    }

    #[OA\Get(
        path: '/api/admin/multi-type-settings/{settingKey}',
        description: 'Fetches a single multi type setting by ID',
        summary: 'Get one multi type setting by ID',
        security: [['Bearer' => []]],
        tags: ['Admin Multi Type Setting'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(
        name: 'settingKey',
        description: 'the multi type setting to retrieve',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string'),
        example: 'FACEBOOK_LINK'
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns Get One Multi Type Setting',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/MultiTypeSetting', type: 'object'),
                ]
            )
        )
    )]
    public function show($settingKey): JsonResponse
    {
        $multiTypeSetting = $this->multiTypeSettingService->findBySettingKey($settingKey);

        return $this
            ->setResourceClass(MultiTypeSettingResource::class)
            ->setSerializedGroup(SerializedGroup::Details->value)
            ->successResponse($multiTypeSetting);
    }

    #[OA\Put(
        path: '/api/admin/multi-type-settings/{multi_type_setting}',
        description: 'Update one multi type setting',
        summary: 'Update multi type setting by ID',
        security: [['Bearer' => []]],
        tags: ['Admin Multi Type Setting'],
    )]
    #[OA\Parameter(ref: '#/components/parameters/x-locale')]
    #[OA\Parameter(
        name: 'multi_type_setting',
        description: 'the multi type setting to update',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer'),
        example: 1
    )]
    #[OA\RequestBody(
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'value', type: 'string', example: 'https://www.facebook.com'),
                    new OA\Property(property: 'type', type: 'string', enum: ['EMAIL', 'LINK', 'NUMBER', 'PHONE_NUMBER', 'TEXT'], example: 'TEXT'),
                    new OA\Property(property: 'description', type: 'string', example: 'description multi type setting'),
                ]
            )
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Returns Updated Multi Type Setting',
        content: new OA\MediaType(
            mediaType: 'application/json',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/MultiTypeSetting', type: 'object'),
                ]
            )
        )
    )]
    public function store(MultiTypeSettingRequest $multiTypeSettingRequest): JsonResponse
    {
        return parent::baseStore($multiTypeSettingRequest);
    }

    public function update(MultiTypeSettingRequest $multiTypeSettingRequest, MultiTypeSetting $multiTypeSetting): JsonResponse
    {
        return parent::baseUpdate($multiTypeSettingRequest, $multiTypeSetting);
    }

    public function destroy(MultiTypeSetting $multiTypeSetting): JsonResponse
    {
        return parent::baseDestroy($multiTypeSetting);
    }

    #[OA\Get(
        path: '/api/admin/multi-type-settings/export',
        description: 'download every multi type settings the current filters select as a csv file. The file carries all '
            .'the columns of the record, its translated fields written in the language the x-locale header '
            .'asks for, and the names behind its relations — a brand, a category, a product, never a bare '
            .'id. It takes the same filters index() takes, without the paging.',
        summary: 'export multi type settings as csv',
        security: [['Bearer' => []]],
        tags: ['Admin Multi Type Setting'],
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
    public function export(MultiTypeSettingFilter $filter): StreamedResponse
    {
        return parent::baseExport($filter, 'multi-type-settings');
    }
}
