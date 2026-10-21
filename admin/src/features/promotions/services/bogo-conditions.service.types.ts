import type {
  BogoCondition,
  BogoConditionFormData,
} from "@/features/promotions/types/promotions.types";
import type { PaginatedResult } from "@/shared/types";

export type BogoConditionListParams = {
  page?: number;
  limit?: number;
  bogoPromotionId?: number;
  productId?: number;
  productVariantId?: number;
  sort?: string;
  direction?: "asc" | "desc";
};

export interface BogoConditionsService {
  list(
    params?: BogoConditionListParams,
    signal?: AbortSignal,
  ): Promise<PaginatedResult<BogoCondition>>;
  getById(id: number, signal?: AbortSignal): Promise<BogoCondition>;
  create(data: BogoConditionFormData): Promise<BogoCondition>;
  update(id: number, data: Partial<BogoConditionFormData>): Promise<BogoCondition>;
  delete(id: number): Promise<void>;
}
