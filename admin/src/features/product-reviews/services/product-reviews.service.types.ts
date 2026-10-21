import type {
  ProductReviewCatalogParams,
  ProductReviewCatalogResult,
  ProductReviewFormData,
  ProductReviewListParams,
  ProductReviewListResult,
  ProductReviewRow,
} from "@/features/product-reviews/types/product-reviews.types";

export type ProductReviewsService = {
  list(productId: number, params?: ProductReviewListParams, signal?: AbortSignal): Promise<ProductReviewListResult>;
  listCatalog(params?: ProductReviewCatalogParams): Promise<ProductReviewCatalogResult>;
  getById(productId: number, reviewId: number): Promise<ProductReviewRow>;
  create(productId: number, data: ProductReviewFormData): Promise<ProductReviewRow>;
  update(
    productId: number,
    reviewId: number,
    data: Partial<ProductReviewFormData>,
  ): Promise<ProductReviewRow>;
  delete(productId: number, reviewId: number): Promise<void>;
};
