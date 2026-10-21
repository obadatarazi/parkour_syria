import {
  hasFormChanges,
  pickChangedScalar,
  pickChangedTranslations,
} from "@/shared/lib/form/pick-changed-fields";
import type { TranslationsInput } from "@/shared/lib/api/form-data.utils";
import type { PaginatedResult } from "@/shared/types";

export type StateCountryRef = {
  id: number;
  title: string;
};

export type StateTranslation = {
  title: string;
};

export type State = {
  id: number;
  title: string;
  publish: boolean;
  country?: StateCountryRef | null;
  createdAt?: string;
  updatedAt?: string;
  translations?: Partial<Record<"en" | "ar", StateTranslation>>;
};

export type StateListParams = {
  page?: number;
  limit?: number;
  search?: string;
  publish?: boolean;
  countryId?: number;
  sort?: string;
  direction?: "asc" | "desc";
};

export type StateFormData = {
  translations: TranslationsInput;
  publish?: boolean;
  countryId: number | null;
};

export type StateListResult = PaginatedResult<State>;

export function createEmptyStateForm(): StateFormData {
  return {
    translations: {
      en: { title: "" },
      ar: { title: "" },
    },
    publish: true,
    countryId: null,
  };
}

export function stateToFormData(state: State): StateFormData {
  return {
    translations: {
      en: { title: state.translations?.en?.title ?? state.title },
      ar: { title: state.translations?.ar?.title ?? "" },
    },
    publish: state.publish,
    countryId: state.country?.id ?? null,
  };
}

export function pickStateFormChanges(
  original: StateFormData,
  current: StateFormData,
): Partial<StateFormData> {
  const changes: Partial<StateFormData> = {
    ...pickChangedScalar(original, current, ["publish", "countryId"]),
  };

  const translationChanges = pickChangedTranslations(original.translations, current.translations);
  if (translationChanges) {
    changes.translations = translationChanges;
  }

  return changes;
}

export function hasStateFormChanges(original: StateFormData, current: StateFormData): boolean {
  return hasFormChanges(pickStateFormChanges(original, current));
}
