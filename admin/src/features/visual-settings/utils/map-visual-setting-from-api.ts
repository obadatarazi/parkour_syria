import type { VisualSetting } from "@/features/visual-settings/types/visual-settings.types";
import {
  getTitleFromApiTranslations,
  normalizeTranslationsFromApi,
} from "@/shared/lib/api";

export function mapVisualSettingFromApi(setting: VisualSetting): VisualSetting {
  const translations = normalizeTranslationsFromApi<{
    title?: string;
    description?: string;
  }>(setting.translations);

  return {
    ...setting,
    title: getTitleFromApiTranslations(setting.translations, setting.title ?? ""),
    description:
      translations?.en?.description?.trim() ||
      translations?.ar?.description?.trim() ||
      setting.description?.trim() ||
      null,
    ...(translations ? { translations: translations as VisualSetting["translations"] } : {}),
  };
}
