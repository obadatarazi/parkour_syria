import type {
  AdminCart,
  CartListParams,
  CartStats,
} from "@/features/carts/types/carts.types";
import type { PaginatedResult } from "@/shared/types";

export interface CartsService {
  list(params?: CartListParams, signal?: AbortSignal): Promise<PaginatedResult<AdminCart>>;
  getById(id: number, signal?: AbortSignal): Promise<AdminCart>;
  getStats(signal?: AbortSignal): Promise<CartStats>;
}
