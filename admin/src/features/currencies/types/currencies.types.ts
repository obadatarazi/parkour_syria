import type { TranslationsInput } from "@/shared/lib/api/form-data.utils";
import {
  hasFormChanges,
  pickChangedScalar,
  pickChangedTranslations,
} from "@/shared/lib/form/pick-changed-fields";
import type { PaginatedResult } from "@/shared/types";

export type CurrencyTranslation = {
  title: string;
};

export type Currency = {
  id: number;
  title: string;
  symbol: string;
  code: string;
  publish: boolean;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
  translations?: Partial<Record<"en" | "ar", CurrencyTranslation>>;
};

export type CurrencyListParams = {
  page?: number;
  limit?: number;
  search?: string;
  code?: string;
  publish?: boolean;
  isDefault?: boolean;
  sort?: string;
  direction?: "asc" | "desc";
};

export type CurrencyFormData = {
  translations: TranslationsInput;
  symbol: string;
  code: string;
  publish?: boolean;
  isDefault?: boolean;
};

export type CurrencyListResult = PaginatedResult<Currency>;

export function createEmptyCurrencyForm(): CurrencyFormData {
  return {
    translations: {
      en: { title: "" },
      ar: { title: "" },
    },
    symbol: "",
    code: "",
    publish: true,
    isDefault: false,
  };
}

export function currencyToFormData(currency: Currency): CurrencyFormData {
  return {
    translations: {
      en: { title: currency.translations?.en?.title ?? currency.title },
      ar: { title: currency.translations?.ar?.title ?? "" },
    },
    symbol: currency.symbol,
    code: currency.code,
    publish: currency.publish,
    isDefault: currency.isDefault,
  };
}

export function pickCurrencyFormChanges(
  original: CurrencyFormData,
  current: CurrencyFormData,
): Partial<CurrencyFormData> {
  const changes: Partial<CurrencyFormData> = {
    ...pickChangedScalar(original, current, ["symbol", "code", "publish", "isDefault"]),
  };

  const translationChanges = pickChangedTranslations(original.translations, current.translations);
  if (translationChanges) {
    changes.translations = translationChanges;
  }

  return changes;
}

export function hasCurrencyFormChanges(
  original: CurrencyFormData,
  current: CurrencyFormData,
): boolean {
  return hasFormChanges(pickCurrencyFormChanges(original, current));
}
