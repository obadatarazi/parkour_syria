import type { ProductReviewsService } from "@/features/product-reviews/services/product-reviews.service.types";
import type {
  ProductReview,
  ProductReviewFormData,
  ProductReviewListParams,
  ProductReviewRow,
} from "@/features/product-reviews/types/product-reviews.types";
import { mapProductReviewFromApi } from "@/features/product-reviews/utils/map-product-review-from-api";
import {
  apiRequest,
  buildLaravelListParams,
  type LaravelPaginatedResponse,
  type LaravelSuccessResponse,
  mapLaravelPagination,
} from "@/shared/lib/api";

const INDEX_PATH = "/admin/product-reviews";

function buildReviewBody(data: Partial<ProductReviewFormData>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (data.userName !== undefined) {
    body.userName = data.userName.trim();
  }
  if (data.ratingStar !== undefined) {
    body.ratingStar = data.ratingStar;
  }
  if (data.comment !== undefined) {
    body.comment = data.comment.trim() || null;
  }
  if (data.publish !== undefined) {
    body.status = data.publish ? "APPROVE" : "PENDING";
  }
  if (data.status !== undefined) {
    body.status = data.status;
  }
  return body;
}

function toReviewRow(review: ProductReview): ProductReviewRow {
  const mapped = mapProductReviewFromApi(review);
  const productId = mapped.product?.id ?? mapped.productId ?? 0;
  const productTitle = mapped.product?.title ?? mapped.productTitle ?? "—";
  const productImageUrl = mapped.product?.featuredImageUrl ?? null;

  return {
    ...mapped,
    productId,
    productTitle,
    productImageUrl,
    product: mapped.product ?? (productId ? { id: productId, title: productTitle, featuredImageUrl: productImageUrl } : undefined),
  };
}

function createApiProductReviewsService(): ProductReviewsService {
  const nestedPath = (productId: number) => `/admin/products/${productId}/product-reviews`;

  async function listIndex(params: ProductReviewListParams = {}, signal?: AbortSignal) {
    const response = await apiRequest<LaravelPaginatedResponse<ProductReview>>(INDEX_PATH, {
      signal,
      params: buildLaravelListParams(
        {
          page: params.page,
          limit: params.limit,
          search: params.search,
          publish: params.publish,
          ratingStar: params.ratingStar,
          productId: params.productId,
          userId: params.userId,
          status: params.status,
          sort: params.sort,
          direction: params.direction,
        },
        { limit: 10 },
      ),
    });

    const paginated = mapLaravelPagination(response);
    return {
      data: paginated.data.map(toReviewRow),
      total: paginated.total,
      page: paginated.page,
      pageSize: paginated.pageSize,
    };
  }

  return {
    async listCatalog(params = {}) {
      const result = await listIndex({
        page: params.page,
        limit: params.limit,
        search: params.search,
        publish: params.publish,
        ratingStar: params.ratingStar,
        status: params.status,
        sort: params.sort ?? "created_at",
        direction: params.direction ?? "desc",
      });

      return {
        rows: result.data,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      };
    },

    async list(productId, params = {}, signal?: AbortSignal) {
      return listIndex({ ...params, productId }, signal);
    },

    async getById(productId, reviewId) {
      const response = await apiRequest<LaravelSuccessResponse<ProductReview>>(
        `${nestedPath(productId)}/${reviewId}`,
      );
      return toReviewRow(response.data);
    },

    async create(productId, data) {
      const response = await apiRequest<LaravelSuccessResponse<ProductReview>>(
        nestedPath(productId),
        {
          method: "POST",
          body: buildReviewBody(data),
        },
      );
      return toReviewRow(response.data);
    },

    async update(productId, reviewId, data) {
      const response = await apiRequest<LaravelSuccessResponse<ProductReview>>(
        `${nestedPath(productId)}/${reviewId}`,
        {
          method: "PUT",
          body: buildReviewBody(data),
        },
      );
      return toReviewRow(response.data);
    },

    async delete(productId, reviewId) {
      await apiRequest(`${nestedPath(productId)}/${reviewId}`, { method: "DELETE" });
    },
  };
}

export { createApiProductReviewsService };
