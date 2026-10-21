import type {
  VisualSetting,
  VisualSettingFormData,
  VisualSettingListParams,
  VisualSettingListResult,
} from "@/features/visual-settings/types/visual-settings.types";

export type VisualSettingsService = {
  list: (params?: VisualSettingListParams, signal?: AbortSignal) => Promise<VisualSettingListResult>;
  getById: (id: number) => Promise<VisualSetting>;
  update: (id: number, data: Partial<VisualSettingFormData>) => Promise<VisualSetting>;
};
