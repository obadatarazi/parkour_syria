import type {
  InventoryListParams,
  InventoryService,
  UpdateInventoryPayload,
} from "@/features/inventory/services/inventory.service.types";
import type { InventorySummary } from "@/features/inventory/types/inventory.types";
import { mapInventorySummaryFromApi } from "@/features/inventory/utils/map-inventory-summary-from-api";
import type { Product } from "@/features/products/types/products.types";
import { mapProductFromApi } from "@/features/products/utils/map-product-from-api";
import {
  apiRequest,
  buildLaravelListParams,
  mapPaginatedFromApi,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
} from "@/shared/lib/api";

type InventoryListApiResponse = LaravelPaginatedResponse<Product> & {
  summary?: InventorySummary;
};

function buildInventoryListRequestParams(params: InventoryListParams = {}) {
  return buildLaravelListParams(
    {
      page: params.page,
      limit: params.limit,
      search: params.search,
      publish: params.publish,
      stockStatus: params.stockStatus,
      brandId: params.brandId,
      type: params.type,
      categoryId: params.categoryId,
      tagId: params.tagId,
      featured: params.featured,
      bestSeller: params.bestSeller,
      newlyArrived: params.newlyArrived,
      isProductYouWillLove: params.isProductYouWillLove,
      skuCode: params.skuCode,
      eanCode: params.eanCode,
      attributeId: params.attributeId,
      attributeValueId: params.attributeValueId,
      sort: params.sort,
      direction: params.direction,
    },
    { limit: 12 },
  );
}

/**
 * Inventory LIST returns product rows with skuCode/eanCode and variants[]
 * (codes, price, stock, attribute labels, images). One request per page —
 * no per-row product getById.
 */
function createApiInventoryService(): InventoryService {
  return {
    async list(params: InventoryListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<InventoryListApiResponse>(
        "/admin/product/inventories",
        {
          signal,
          params: buildInventoryListRequestParams(params),
        },
      );

      return {
        ...mapPaginatedFromApi(response, mapProductFromApi),
        summary: mapInventorySummaryFromApi(response.summary),
      };
    },

    async summary(params: InventoryListParams = {}, signal?: AbortSignal) {
      const response = await apiRequest<InventoryListApiResponse>(
        "/admin/product/inventories",
        {
          signal,
          params: buildInventoryListRequestParams({
            ...params,
            page: 1,
            limit: 1,
          }),
        },
      );

      return mapInventorySummaryFromApi(response.summary);
    },

    async update(data: UpdateInventoryPayload) {
      await apiRequest<LaravelSuccessResponse<null>>("/admin/product/inventories", {
        method: "POST",
        body: {
          eanCode: data.eanCode || undefined,
          skuCode: data.skuCode || undefined,
          price: data.price ?? undefined,
          stock: data.stock ?? undefined,
        },
      });
    },
  };
}

export { createApiInventoryService };
