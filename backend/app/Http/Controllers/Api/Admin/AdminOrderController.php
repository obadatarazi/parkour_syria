<?php

namespace App\Http\Controllers\Api\Admin;

use App\Constant\PermissionType;
use App\Http\Controllers\Api\ApiController;
use App\Http\QueryFilter\OrderFilter;
use App\Http\Requests\Admin\OrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

/**
 * Dormant shop. Routed only with FEATURE_ECOMMERCE=true. Orders are read and moved along their
 * status, never created or deleted from the dashboard.
 */
class AdminOrderController extends ApiController
{
    public function __construct(protected OrderService $orderService)
    {
        $this->permissionPrefix = PermissionType::PermissionManageOrder->getSection();
        $this->resource = OrderResource::class;
        $this->service = $orderService;
        parent::__construct();
    }

    #[OA\Get(path: '/api/admin/orders', description: 'Shop only (FEATURE_ECOMMERCE).', summary: 'get all orders', security: [['Bearer' => []]], tags: ['Admin Order'])]
    #[OA\Parameter(ref: '#/components/parameters/page')]
    #[OA\Parameter(ref: '#/components/parameters/limit')]
    #[OA\Parameter(name: 'status', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'COMPLETED', 'CANCELLED']))]
    #[OA\Response(response: 200, description: 'Paginated orders', content: new OA\JsonContent(ref: '#/components/schemas/Pagination'))]
    public function index(OrderFilter $filter): JsonResponse
    {
        return parent::baseIndex($filter);
    }

    #[OA\Get(path: '/api/admin/orders/{order}', summary: 'get one order', security: [['Bearer' => []]], tags: ['Admin Order'])]
    #[OA\Parameter(name: 'order', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))]
    #[OA\Response(response: 200, description: 'One order', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/Order')]))]
    public function show(Order $order): JsonResponse
    {
        return parent::baseShow($order->load($this->service->getWithRelations()));
    }

    #[OA\Put(path: '/api/admin/orders/{order}', summary: 'change an order status', security: [['Bearer' => []]], tags: ['Admin Order'])]
    #[OA\Parameter(name: 'order', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))]
    #[OA\RequestBody(content: new OA\JsonContent(ref: '#/components/schemas/OrderStatusFormRequest'))]
    #[OA\Response(response: 200, description: 'The updated order', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/Order')]))]
    public function update(OrderRequest $request, Order $order): JsonResponse
    {
        return parent::baseUpdate($request, $order);
    }
}
