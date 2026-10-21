import type { CouponsService } from "@/features/coupons/services/coupons.service.types";
import type {
  Coupon,
  CouponFormData,
  CouponListParams,
} from "@/features/coupons/types/coupons.types";
import { fromDatetimeLocalValue } from "@/features/coupons/types/coupons.types";
import { mapCouponFromApi } from "@/features/coupons/utils/map-coupon-from-api";
import { isServiceError, ServiceError } from "@/shared/errors";
import { decodeAdminRouteKey } from "@/shared/lib/routing/admin-route-keys.utils";
import {
  apiRequest,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapPaginatedFromApi,
  postBulkDelete,
} from "@/shared/lib/api";

function buildPayload(data: Partial<CouponFormData>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (data.translations !== undefined) {
    payload.translations = data.translations;
  }
  if (data.code !== undefined) {
    payload.code = data.code.trim().toUpperCase();
  }
  if (data.couponUrl !== undefined) {
    payload.couponUrl = data.couponUrl.trim() || null;
  }
  if (data.type !== undefined) {
    payload.type = data.type;
  }
  if (data.scope !== undefined) {
    payload.scope = data.scope;
  }
  if (data.applicableTo !== undefined) {
    payload.applicableTo = data.applicableTo.filter((value) => value !== "USER");
  }
  if (data.value !== undefined) {
    payload.value = data.type === "FREE_SHIPPING" ? null : data.value.trim() || null;
  }
  if (data.minimumTotalPrice !== undefined) {
    payload.minimumTotalPrice = data.minimumTotalPrice;
  }
  if (data.usageLimit !== undefined) {
    payload.usageLimit = data.usageLimit;
  }
  if (data.usageLimitPerUser !== undefined) {
    payload.usageLimitPerUser = data.usageLimitPerUser;
  }
  if (data.isAutoApply !== undefined) {
    payload.isAutoApply = data.isAutoApply;
  }
  if (data.isCombinable !== undefined) {
    payload.isCombinable = data.isCombinable;
  }
  if (data.isFirstOrderOnly !== undefined) {
    payload.isFirstOrderOnly = data.isFirstOrderOnly;
  }
  if (data.isRequireLogin !== undefined) {
    payload.isRequireLogin = data.isRequireLogin;
  }
  if (data.isNotifyUsers !== undefined) {
    payload.isNotifyUsers = data.isNotifyUsers;
  }
  if (data.isAdminOnly !== undefined) {
    payload.isAdminOnly = data.isAdminOnly;
  }
  if (data.priority !== undefined) {
    payload.priority = data.priority;
  }
  if (data.startsAt !== undefined) {
    payload.startsAt = fromDatetimeLocalValue(data.startsAt) || null;
  }
  if (data.expireAt !== undefined) {
    payload.expireAt = fromDatetimeLocalValue(data.expireAt) || null;
  }
  if (data.status !== undefined) {
    payload.status = data.status;
  }
  if (data.audience !== undefined) {
    payload.audience = data.audience;
  }

  if (data.productIds !== undefined) {
    payload.productIds = data.productIds;
  }
  if (data.productVariantIds !== undefined) {
    payload.productVariantIds = data.productVariantIds;
  }
  if (data.brandIds !== undefined) {
    payload.brandIds = data.brandIds;
  }
  if (data.categoryIds !== undefined) {
    payload.categoryIds = data.categoryIds;
  }
  if (data.tagIds !== undefined) {
    payload.tagIds = data.tagIds;
  }
  if (data.users !== undefined) {
    payload.users = data.users
      .filter((user) => user.userId != null)
      .map((user) => ({
        userId: user.userId,
        usageLimit: user.usageLimit,
        startsAt: fromDatetimeLocalValue(user.startsAt) || null,
        expireAt: fromDatetimeLocalValue(user.expireAt) || null,
      }));
  }

  // When type changes to free shipping on a partial update, clear value and lock scope.
  if (data.type === "FREE_SHIPPING") {
    if (data.value === undefined) {
      payload.value = null;
    }
    if (data.scope === undefined) {
      payload.scope = "SHIPPING";
    }
  }

  return payload;
}

function createApiCouponsService(): CouponsService {
  const service: CouponsService = {
    async list(params: CouponListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<LaravelPaginatedResponse<Coupon>>("/admin/coupons", {
        signal,
        params: buildLaravelListParams(
          {
            page: params.page,
            limit: params.limit,
            search: params.search,
            code: params.code,
            type: params.type,
            scope: params.scope,
            status: params.status,
            audience: params.audience,
            applicableTo: params.applicableTo?.length
              ? params.applicableTo.join(",")
              : undefined,
            isAutoApply: params.isAutoApply,
            isCombinable: params.isCombinable,
            isFirstOrderOnly: params.isFirstOrderOnly,
            isRequireLogin: params.isRequireLogin,
            isAdminOnly: params.isAdminOnly,
            sort: params.sort,
            direction: params.direction,
          },
          { limit: 20 },
        ),
      });
      return mapPaginatedFromApi(response, mapCouponFromApi);
    },

    async getById(id, signal?: AbortSignal) {
      const response = await apiRequest<LaravelSuccessResponse<Coupon>>(`/admin/coupons/${id}`, {
        signal,
      });
      return mapCouponFromApi(response.data);
    },

    async getByCodeOrId(idOrCode, signal?: AbortSignal) {
      const raw = String(idOrCode).trim();
      if (!raw) {
        throw new ServiceError("not_found");
      }

      const findByCode = async (code: string): Promise<Coupon> => {
        const normalized = code.toUpperCase();
        const listed = await service.list({ code: normalized, page: 1, limit: 20 }, signal);
        const match = listed.data.find((item) => item.code.toUpperCase() === normalized);
        if (!match) {
          throw new ServiceError("not_found");
        }
        return service.getById(match.id, signal);
      };

      if (!/^\d+$/.test(raw)) {
        return findByCode(raw);
      }

      try {
        return await service.getById(Number(raw), signal);
      } catch (error) {
        if (isServiceError(error) && error.code === "not_found") {
          return findByCode(raw);
        }
        throw error;
      }
    },

    async resolveRouteKey(routeKey, signal?: AbortSignal) {
      const decoded = decodeAdminRouteKey(routeKey) ?? routeKey.trim();
      if (!decoded) {
        throw new ServiceError("not_found");
      }
      return service.getByCodeOrId(decoded, signal);
    },

    async create(data: CouponFormData) {
      const response = await apiRequest<LaravelSuccessResponse<Coupon>>("/admin/coupons", {
        method: "POST",
        body: buildPayload(data),
      });
      return mapCouponFromApi(response.data);
    },

    async update(id, data: Partial<CouponFormData>) {
      const response = await apiRequest<LaravelSuccessResponse<Coupon>>(`/admin/coupons/${id}`, {
        method: "PUT",
        body: buildPayload(data),
      });
      return mapCouponFromApi(response.data);
    },

    async delete(id) {
      await apiRequest(`/admin/coupons/${id}`, { method: "DELETE" });
    },

    async bulkDelete(ids) {
      return postBulkDelete("/admin/coupons/bulk-delete", ids);
    },
  };

  return service;
}

export { createApiCouponsService };
