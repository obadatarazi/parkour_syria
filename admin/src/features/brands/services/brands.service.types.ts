import type {
  Brand,
  BrandFormData,
  BrandListParams,
  BrandListResult,
} from "@/features/brands/types/brands.types";
import type { BulkDeleteApiResult } from "@/shared/lib/api";

export interface BrandsService {
  list(params?: BrandListParams, signal?: AbortSignal): Promise<BrandListResult>;
  getById(id: number, signal?: AbortSignal): Promise<Brand>;
  getBySlug(slug: string): Promise<Brand>;
  create(data: BrandFormData): Promise<Brand>;
  update(id: number, data: Partial<BrandFormData>): Promise<Brand>;
  delete(id: number): Promise<void>;
  bulkDelete(ids: Array<string | number>): Promise<BulkDeleteApiResult>;
}
