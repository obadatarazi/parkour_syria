<?php

namespace App\Http\Controllers\Api\Admin;

use App\Constant\PermissionType;
use App\Http\Controllers\Api\ApiController;
use App\Http\QueryFilter\CouponFilter;
use App\Http\Requests\Admin\BulkDeleteRequest;
use App\Http\Requests\Admin\CouponRequest;
use App\Http\Resources\CouponResource;
use App\Models\Coupon;
use App\Services\CouponService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

/**
 * Dormant shop. Routed only with FEATURE_ECOMMERCE=true.
 */
class AdminCouponController extends ApiController
{
    public function __construct(protected CouponService $couponService)
    {
        $this->permissionPrefix = PermissionType::PermissionManageCoupon->getSection();
        $this->resource = CouponResource::class;
        $this->service = $couponService;
        parent::__construct();
    }

    #[OA\Get(path: '/api/admin/coupons', description: 'Shop only (FEATURE_ECOMMERCE).', summary: 'get all coupons', security: [['Bearer' => []]], tags: ['Admin Coupon'])]
    #[OA\Parameter(ref: '#/components/parameters/page')]
    #[OA\Parameter(ref: '#/components/parameters/limit')]
    #[OA\Parameter(name: 'search', in: 'query', required: false, schema: new OA\Schema(type: 'string'))]
    #[OA\Response(response: 200, description: 'Paginated coupons', content: new OA\JsonContent(ref: '#/components/schemas/Pagination'))]
    public function index(CouponFilter $filter): JsonResponse
    {
        return parent::baseIndex($filter);
    }

    #[OA\Post(path: '/api/admin/coupons', summary: 'create coupon', security: [['Bearer' => []]], tags: ['Admin Coupon'])]
    #[OA\RequestBody(content: new OA\JsonContent(ref: '#/components/schemas/CouponFormRequest'))]
    #[OA\Response(response: 201, description: 'The created coupon', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/Coupon')]))]
    public function store(CouponRequest $request): JsonResponse
    {
        return parent::baseStore($request);
    }

    #[OA\Get(path: '/api/admin/coupons/{coupon}', summary: 'get one coupon', security: [['Bearer' => []]], tags: ['Admin Coupon'])]
    #[OA\Parameter(name: 'coupon', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))]
    #[OA\Response(response: 200, description: 'One coupon', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/Coupon')]))]
    public function show(Coupon $coupon): JsonResponse
    {
        return parent::baseShow($coupon);
    }

    #[OA\Put(path: '/api/admin/coupons/{coupon}', summary: 'update coupon', security: [['Bearer' => []]], tags: ['Admin Coupon'])]
    #[OA\Parameter(name: 'coupon', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))]
    #[OA\RequestBody(content: new OA\JsonContent(ref: '#/components/schemas/CouponFormRequest'))]
    #[OA\Response(response: 200, description: 'The updated coupon', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/Coupon')]))]
    public function update(CouponRequest $request, Coupon $coupon): JsonResponse
    {
        return parent::baseUpdate($request, $coupon);
    }

    #[OA\Delete(path: '/api/admin/coupons/{coupon}', summary: 'delete coupon', security: [['Bearer' => []]], tags: ['Admin Coupon'])]
    #[OA\Parameter(name: 'coupon', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))]
    #[OA\Response(response: 200, description: 'The deleted coupon', content: new OA\JsonContent(properties: [new OA\Property(property: 'data', ref: '#/components/schemas/Coupon')]))]
    public function destroy(Coupon $coupon): JsonResponse
    {
        return parent::baseDestroy($coupon);
    }

    #[OA\Post(path: '/api/admin/coupons/bulk-delete', summary: 'bulk delete coupons', security: [['Bearer' => []]], tags: ['Admin Coupon'])]
    #[OA\RequestBody(content: new OA\JsonContent(ref: '#/components/schemas/BulkDeleteFormRequest'))]
    #[OA\Response(response: 200, description: 'Outcome of the bulk delete', content: new OA\JsonContent(ref: '#/components/schemas/BulkDeleteResult'))]
    public function bulkDestroy(BulkDeleteRequest $bulkDeleteRequest): JsonResponse
    {
        return parent::baseBulkDestroy($bulkDeleteRequest);
    }
}
