import type {
  PaymentProvider,
  PaymentProviderTranslation,
  PaymentProviderTypeOption,
  PaymentProviderTypeValue,
} from "@/features/payment-providers/types/payment-providers.types";
import { mapTranslatableFromApi } from "@/shared/lib/api/map-translatable-from-api.utils";
import { normalizeEnumLabelValue } from "@/shared/lib/api/normalize-enum.utils";
import {
  getTitleFromApiTranslations,
  normalizeTranslationsFromApi,
} from "@/shared/lib/api/normalize-translations.utils";

type RawPaymentProvider = Omit<PaymentProvider, "type" | "standard" | "title"> & {
  title?: string;
  type?: string | PaymentProviderTypeOption | null;
  standard?: boolean;
};

function mapType(
  type: RawPaymentProvider["type"],
): PaymentProviderTypeOption | undefined {
  const normalized = normalizeEnumLabelValue(type);
  if (!normalized?.value) return undefined;
  return {
    value: normalized.value as PaymentProviderTypeValue,
    label: normalized.label ?? normalized.value,
  };
}

function mapTranslations(
  raw: RawPaymentProvider["translations"],
): Partial<Record<"en" | "ar", PaymentProviderTranslation>> | undefined {
  const normalized = normalizeTranslationsFromApi<{
    title?: string;
    description?: string | null;
  }>(raw);
  if (!normalized) return undefined;

  const result: Partial<Record<"en" | "ar", PaymentProviderTranslation>> = {};
  for (const locale of ["en", "ar"] as const) {
    const entry = normalized[locale];
    if (!entry) continue;
    result[locale] = {
      title: entry.title ?? "",
      description: entry.description ?? "",
    };
  }
  return result;
}

export function mapPaymentProviderFromApi(provider: RawPaymentProvider): PaymentProvider {
  const mapped = mapTranslatableFromApi(provider);
  const translations = mapTranslations(provider.translations) ?? mapped.translations;
  const title =
    mapped.title?.trim() ||
    getTitleFromApiTranslations(provider.translations, "") ||
    "";

  return {
    ...mapped,
    title,
    description:
      mapped.description ??
      translations?.en?.description ??
      translations?.ar?.description ??
      null,
    translations,
    type: mapType(provider.type),
    standard: provider.standard,
    imageFileUrl: provider.imageFileUrl ?? null,
  };
}
