import type {
  Slider,
  SliderFormData,
  SliderListParams,
  SliderListResult,
} from "@/features/sliders/types/sliders.types";
import type { BulkDeleteApiResult } from "@/shared/lib/api";

export interface SlidersService {
  list(params?: SliderListParams, signal?: AbortSignal): Promise<SliderListResult>;
  getById(id: number): Promise<Slider>;
  create(data: SliderFormData): Promise<Slider>;
  update(id: number, data: Partial<SliderFormData>): Promise<Slider>;
  delete(id: number): Promise<void>;
  bulkDelete(ids: Array<string | number>): Promise<BulkDeleteApiResult>;
}
