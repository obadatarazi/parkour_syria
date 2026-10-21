<?php

namespace App\Http\Controllers\Api;

use App\Constant\SerializedGroup;
use App\Http\QueryFilter\QueryFilter;
use App\Services\CsvExportService;
use App\Traits\ApiResponser;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller as BaseController;
use Symfony\Component\HttpFoundation\StreamedResponse;
use OpenApi\Attributes as OA;

#[OA\Info(
    version: "1.0.0",
    title: "Parkour Syria API"
)]
#[OA\SecurityScheme(
    securityScheme: "Bearer",
    type: "http",
    name: "Bearer",
    in: "header",
    bearerFormat: "JWT",
    scheme: "Bearer"
)]
class ApiController extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;
    use ApiResponser;

    protected $permissionPrefix;
    protected $service;
    protected $resource;
    public function __construct()
    {
        $this->appendGeneralPermissions();
    }

    public function appendGeneralPermissions(): void
    {
        $this->middleware(["permission:MANAGE_$this->permissionPrefix|PERMISSION_SHOW_$this->permissionPrefix|PERMISSION_UPDATE_$this->permissionPrefix|PERMISSION_DELETE_$this->permissionPrefix"], ['only' => ['index', 'show', 'export']]);
        $this->middleware(["permission:MANAGE_$this->permissionPrefix|PERMISSION_CREATE_$this->permissionPrefix"], ['only' => ['store']]);
        $this->middleware(["permission:MANAGE_$this->permissionPrefix|PERMISSION_UPDATE_$this->permissionPrefix"], ['only' => ['update', 'bulkUpdate', 'bulkAdjustPrice']]);
        $this->middleware(["permission:MANAGE_$this->permissionPrefix|PERMISSION_DELETE_$this->permissionPrefix"], ['only' => ['destroy', 'bulkDestroy']]);
    }

    public function baseIndex(QueryFilter $queryFilter, $isOnlyPublished = false, array $extra = []): JsonResponse
    {
        $items = $isOnlyPublished ? $this->service->findAllPublished($queryFilter)
            :  $this->service->findAllPaginated($queryFilter);

        return $this
            ->setResourceClass($this->resource)
            ->setSerializedGroup(SerializedGroup::List->value)
            ->successPaginatedResponse($this->resource, $items, $extra);
    }

    public function baseIndexUser(QueryFilter $queryFilter, $user, array $extra = []): JsonResponse
    {
        $items = $this->service->findAllPaginatedByUser($queryFilter, $user);

        return $this
            ->setResourceClass($this->resource)
            ->setSerializedGroup(SerializedGroup::List->value)
            ->successPaginatedResponse($this->resource, $items, $extra);
    }

    /**
     * Streams the whole listing as a csv, filtered exactly like index() is — an admin exports what
     * the table in front of them is showing, minus the paging.
     *
     * The file carries every column of the record, its translated fields in the language the
     * request asked for, and the names behind its relations — a brand, a category, a product —
     * rather than the keys that point at them; CsvExportService reads all of that off the schema
     * so nothing is missing from it.
     *
     * @param string $name The base of the downloaded file name, the timestamp is appended to it.
     * @param list<string>|null $columns Csv headers to keep. Null keeps every column.
     */
    public function baseExport(QueryFilter $queryFilter, string $name, ?array $columns = null): StreamedResponse
    {
        return app(CsvExportService::class)->download($this->service->exportQuery($queryFilter), $name, $columns);
    }

    public function baseStore(Request $request): JsonResponse
    {
        $object = $this->service->create($request->validated());

        return $this
            ->setResourceClass($this->resource)
            ->setSerializedGroup(SerializedGroup::Details->value)
            ->successResponse($object, 201);
    }

    public function baseShow(Model $object): JsonResponse
    {
        return $this
            ->setResourceClass($this->resource)
            ->setSerializedGroup(SerializedGroup::Details->value)
            ->successResponse($object);
    }

    public function baseUpdate(Request $request, Model $object): JsonResponse
    {
        $object = $this->service->update($request->validated(), $object);

        return $this
            ->setResourceClass($this->resource)
            ->setSerializedGroup(SerializedGroup::Details->value)
            ->successResponse($object);
    }

    /**
     * Deletes a selection in one call. The ids are taken from the validated body, never from the
     * route, and `$scope` is how a nested resource keeps the selection inside its parent — without
     * it, a caller could pass the id of an image belonging to another product.
     *
     * The answer is the outcome of the delete rather than the deleted records: a selection of a few
     * hundred rows serialised back through the resource is a response nobody reads.
     *
     * @param array<string, mixed> $scope
     */
    public function baseBulkDestroy(Request $request, array $scope = []): JsonResponse
    {
        $result = $this->service->bulkDelete($request->validated()['ids'], $scope);

        return $this
            ->setResourceClass(null)
            ->successResponse($result);
    }

    public function baseDestroy(Model $object): JsonResponse
    {
        $this->service->delete($object);

        return $this
            ->setResourceClass($this->resource)
            ->setSerializedGroup(SerializedGroup::Details->value)
            ->successResponse($object);
    }
}
