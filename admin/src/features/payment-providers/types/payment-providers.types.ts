import {
  hasFormChanges,
  pickChangedScalar,
  pickChangedTranslations,
} from "@/shared/lib/form/pick-changed-fields";
import type { TranslationsInput } from "@/shared/lib/api/form-data.utils";
import type { PaginatedResult } from "@/shared/types";

export type PaymentProviderTypeValue = "CASH_ON_DELIVERY" | "MYFATOORAH" | "HESABE";

export type PaymentProviderTypeOption = {
  label: string;
  value: PaymentProviderTypeValue;
};

export type PaymentProviderTranslation = {
  title: string;
  description?: string | null;
};

export type PaymentProvider = {
  id: number;
  title: string;
  description?: string | null;
  imageFileUrl?: string | null;
  /** Details — missing on slim list. */
  type?: PaymentProviderTypeOption;
  /** Details — missing on slim list; protect deletes via getById. */
  standard?: boolean;
  publish: boolean;
  createdAt?: string;
  updatedAt?: string;
  translations?: Partial<Record<"en" | "ar", PaymentProviderTranslation>>;
};

export type PaymentProviderListParams = {
  page?: number;
  limit?: number;
  search?: string;
  publish?: boolean;
  standard?: boolean;
  type?: PaymentProviderTypeValue;
  sort?: string;
  direction?: "asc" | "desc";
};

export type PaymentProviderFormData = {
  translations: TranslationsInput;
  type: PaymentProviderTypeValue;
  publish?: boolean;
  standard?: boolean;
  image?: File | null;
};

export type PaymentProviderListResult = PaginatedResult<PaymentProvider>;

export function createEmptyPaymentProviderForm(): PaymentProviderFormData {
  return {
    translations: {
      en: { title: "", description: "" },
      ar: { title: "", description: "" },
    },
    type: "MYFATOORAH",
    publish: true,
    standard: false,
    image: null,
  };
}

export function paymentProviderToFormData(
  provider: PaymentProvider,
): PaymentProviderFormData {
  return {
    translations: {
      en: {
        title: provider.translations?.en?.title ?? provider.title,
        description:
          provider.translations?.en?.description ?? provider.description ?? "",
      },
      ar: {
        title: provider.translations?.ar?.title ?? "",
        description: provider.translations?.ar?.description ?? "",
      },
    },
    type: provider.type?.value ?? "MYFATOORAH",
    publish: provider.publish,
    standard: provider.standard ?? false,
    image: null,
  };
}

export function pickPaymentProviderFormChanges(
  original: PaymentProviderFormData,
  current: PaymentProviderFormData,
): Partial<PaymentProviderFormData> {
  const changes: Partial<PaymentProviderFormData> = {
    ...pickChangedScalar(original, current, ["publish", "standard", "type"]),
  };

  const translationChanges = pickChangedTranslations(
    original.translations,
    current.translations,
  );
  if (translationChanges) {
    changes.translations = translationChanges;
  }

  if (current.image instanceof File) {
    changes.image = current.image;
  }

  return changes;
}

export function hasPaymentProviderFormChanges(
  original: PaymentProviderFormData,
  current: PaymentProviderFormData,
): boolean {
  return hasFormChanges(pickPaymentProviderFormChanges(original, current));
}
