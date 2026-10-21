import type { ProductImportSummary } from "@/features/products/types/product-import.types";
import type {
  Product,
  ProductFormData,
  ProductListParams,
  ProductListResult,
  ProductType,
} from "@/features/products/types/products.types";
import type { BulkDeleteApiResult } from "@/shared/lib/api";

export type ProductBulkUpdateVariantEntry = {
  id: number;
  price?: number;
  hasDiscountPrice?: boolean;
  priceDiscount?: number | null;
  priceDiscountPercentage?: string | null;
};

export type ProductBulkUpdateEntry = {
  id: number;
  publish?: boolean;
  featured?: boolean;
  bestSeller?: boolean;
  newlyArrived?: boolean;
  isProductYouWillLove?: boolean;
  approveAddToCarePlan?: boolean;
  price?: number;
  hasDiscountPrice?: boolean;
  priceDiscount?: number | null;
  priceDiscountPercentage?: string | null;
  variants?: ProductBulkUpdateVariantEntry[];
};

/** Matches `BulkAdjustProductPriceRequest::MAX_IDS`. */
export const BULK_ADJUST_PRICE_MAX_IDS = 500;

export type ProductBulkAdjustPriceDirection = "increase" | "decrease";
export type ProductBulkAdjustPriceMode = "amount" | "percent";

export type ProductBulkAdjustPriceInput = {
  ids: Array<string | number>;
  direction: ProductBulkAdjustPriceDirection;
  mode: ProductBulkAdjustPriceMode;
  value: number;
};

export type ProductBulkAdjustPriceChange = {
  id: number;
  oldPrice: string;
  newPrice: string;
};

export type ProductBulkAdjustPriceResult = {
  updatedCount: number;
  updated: ProductBulkAdjustPriceChange[];
  skippedIds: number[];
  notFoundIds: number[];
};

/** Backend trash bulk endpoints return `{ count, ids, notFoundIds }`. */
export type ProductTrashBulkApiResult = {
  count: number;
  ids: number[];
  notFoundIds: number[];
};

export type ProductsService = {
  list: (params?: ProductListParams, signal?: AbortSignal) => Promise<ProductListResult>;
  listTrashed: (params?: ProductListParams, signal?: AbortSignal) => Promise<ProductListResult>;
  getById: (id: number, signal?: AbortSignal) => Promise<Product>;
  getBySlug: (slug: string) => Promise<Product>;
  resolveRouteKey: (routeKey: string, signal?: AbortSignal) => Promise<Product>;
  create: (data: ProductFormData) => Promise<Product>;
  update: (
    id: number,
    data: Partial<ProductFormData>,
    context?: { type?: ProductType },
  ) => Promise<Product>;
  delete: (id: number) => Promise<void>;
  bulkDelete: (ids: Array<string | number>) => Promise<BulkDeleteApiResult>;
  restore: (id: number) => Promise<Product>;
  bulkRestore: (ids: Array<string | number>) => Promise<BulkDeleteApiResult>;
  forceDelete: (id: number) => Promise<void>;
  bulkForceDelete: (ids: Array<string | number>) => Promise<BulkDeleteApiResult>;
  bulkUpdate: (entries: ProductBulkUpdateEntry[]) => Promise<Product[]>;
  bulkAdjustPrice: (input: ProductBulkAdjustPriceInput) => Promise<ProductBulkAdjustPriceResult>;
  importFromCsv: (file: File) => Promise<ProductImportSummary>;
};
