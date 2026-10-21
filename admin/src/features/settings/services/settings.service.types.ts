import type {
  MultiTypeSetting,
  MultiTypeSettingFormData,
  MultiTypeSettingListParams,
  MultiTypeSettingUpdateInput,
} from "@/features/settings/types/settings.types";
import type { PaginatedResult } from "@/shared/types";

export interface SettingsService {
  list(params?: MultiTypeSettingListParams, signal?: AbortSignal): Promise<PaginatedResult<MultiTypeSetting>>;
  getById(id: number): Promise<MultiTypeSetting>;
  create(data: MultiTypeSettingFormData): Promise<MultiTypeSetting>;
  update(id: number, input: MultiTypeSettingUpdateInput): Promise<MultiTypeSetting>;
  delete(id: number): Promise<void>;
}
