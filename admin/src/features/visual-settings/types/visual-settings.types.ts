import type { TranslationsInput } from "@/shared/lib/api/form-data.utils";
import {
  hasFormChanges,
  pickChangedScalar,
  pickChangedTranslations,
} from "@/shared/lib/form/pick-changed-fields";
import type { PaginatedResult } from "@/shared/types";

export type VisualSettingTranslation = {
  title: string;
  description?: string | null;
};

export type VisualSetting = {
  id: number;
  settingKey: string;
  imageFileUrl?: string | null;
  link?: string | null;
  title?: string | null;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  translations?: Partial<Record<"en" | "ar", VisualSettingTranslation>>;
};

export type VisualSettingListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  direction?: "asc" | "desc";
};

export type VisualSettingFormData = {
  translations: TranslationsInput;
  link?: string;
  image?: File | null;
};

export type VisualSettingListResult = PaginatedResult<VisualSetting>;

export function formatVisualSettingKey(settingKey: string): string {
  return settingKey
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function createEmptyVisualSettingForm(): VisualSettingFormData {
  return {
    translations: {
      en: { title: "", description: "" },
      ar: { title: "", description: "" },
    },
    link: "",
    image: null,
  };
}

export function visualSettingToFormData(setting: VisualSetting): VisualSettingFormData {
  return {
    translations: {
      en: {
        title: setting.translations?.en?.title ?? setting.title ?? "",
        description: setting.translations?.en?.description ?? setting.description ?? "",
      },
      ar: {
        title: setting.translations?.ar?.title ?? "",
        description: setting.translations?.ar?.description ?? "",
      },
    },
    link: setting.link ?? "",
    image: null,
  };
}

export function pickVisualSettingFormChanges(
  original: VisualSettingFormData,
  current: VisualSettingFormData,
): Partial<VisualSettingFormData> {
  const changes: Partial<VisualSettingFormData> = {
    ...pickChangedScalar(original, current, ["link"], (_key, a, b) => (a ?? "") !== (b ?? "")),
  };

  const translationChanges = pickChangedTranslations(original.translations, current.translations);
  if (translationChanges) {
    changes.translations = translationChanges;
  }

  if (current.image instanceof File) {
    changes.image = current.image;
  }

  return changes;
}

export function hasVisualSettingFormChanges(
  original: VisualSettingFormData,
  current: VisualSettingFormData,
): boolean {
  return hasFormChanges(pickVisualSettingFormChanges(original, current));
}
