export type LocaleCode = "en" | "ar";

export type TranslationInput = {
  title: string;
  description?: string;
};

export type ProductTranslationInput = {
  title?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  benefits?: string;
  ingredients?: string;
  usageMethod?: string;
  warnings?: string;
  countryOfOrigin?: string;
};

export type TranslationsInput = Partial<Record<LocaleCode, TranslationInput>>;

export type ProductTranslationsInput = Partial<Record<LocaleCode, ProductTranslationInput>>;

type AppendStringOptions = {
  /** When true, empty strings are still appended (used to clear fields on update). */
  allowEmpty?: boolean;
};

export function appendTranslations(formData: FormData, translations: TranslationsInput): void {
  for (const [locale, translation] of Object.entries(translations)) {
    if (!translation?.title.trim()) continue;
    formData.append(`translations[${locale}][title]`, translation.title.trim());
    if (translation.description?.trim()) {
      formData.append(`translations[${locale}][description]`, translation.description.trim());
    }
  }
}

function appendTranslationField(
  formData: FormData,
  key: string,
  value: string | undefined,
  options: AppendStringOptions,
): void {
  if (value === undefined) return;
  const trimmed = value.trim();
  if (!trimmed && !options.allowEmpty) return;
  formData.append(key, trimmed);
}

/**
 * Appends product translation fields that are present on the object.
 * With `allowEmpty`, present-but-empty keys are sent so the API can clear them.
 */
function productLocaleHasNonTitleContent(translation: ProductTranslationInput): boolean {
  return Boolean(
    translation.slug?.trim() ||
      translation.description?.trim() ||
      translation.metaTitle?.trim() ||
      translation.metaDescription?.trim() ||
      translation.benefits?.trim() ||
      translation.ingredients?.trim() ||
      translation.usageMethod?.trim() ||
      translation.warnings?.trim() ||
      translation.countryOfOrigin?.trim(),
  );
}

export function appendProductTranslations(
  formData: FormData,
  translations: ProductTranslationsInput,
  options: AppendStringOptions = {},
): void {
  for (const [locale, translation] of Object.entries(translations)) {
    if (!translation) continue;

    const prefix = `translations[${locale}]`;
    const titleTrimmed = translation.title?.trim() ?? "";

    // Never send orphan locale fields without a title on create payloads.
    // MySQL rejects product_translations inserts when title has no default.
    if (!options.allowEmpty && !titleTrimmed) {
      if ("title" in translation || productLocaleHasNonTitleContent(translation)) {
        continue;
      }
    }

    if ("title" in translation) {
      appendTranslationField(formData, `${prefix}[title]`, translation.title, options);
    }
    if ("metaTitle" in translation) {
      appendTranslationField(formData, `${prefix}[meta_title]`, translation.metaTitle, options);
    }
    if ("description" in translation) {
      appendTranslationField(formData, `${prefix}[description]`, translation.description, options);
    }
    if ("metaDescription" in translation) {
      appendTranslationField(
        formData,
        `${prefix}[meta_description]`,
        translation.metaDescription,
        options,
      );
    }
    if ("benefits" in translation) {
      appendTranslationField(formData, `${prefix}[benefits]`, translation.benefits, options);
    }
    if ("ingredients" in translation) {
      appendTranslationField(formData, `${prefix}[ingredients]`, translation.ingredients, options);
    }
    if ("usageMethod" in translation) {
      appendTranslationField(formData, `${prefix}[usage_method]`, translation.usageMethod, options);
    }
    if ("warnings" in translation) {
      appendTranslationField(formData, `${prefix}[warnings]`, translation.warnings, options);
    }
    if ("countryOfOrigin" in translation) {
      appendTranslationField(
        formData,
        `${prefix}[country_of_origin]`,
        translation.countryOfOrigin,
        options,
      );
    }
    if ("slug" in translation) {
      appendTranslationField(formData, `${prefix}[slug]`, translation.slug, options);
    }
  }
}

export function appendBoolean(
  formData: FormData,
  key: string,
  value: boolean | undefined,
): void {
  if (value === undefined) return;
  formData.append(key, value ? "1" : "0");
}

export function appendOptional(
  formData: FormData,
  key: string,
  value: string | number | undefined | null,
  options: AppendStringOptions = {},
): void {
  if (value === undefined || value === null) return;
  if (value === "" && !options.allowEmpty) return;
  formData.append(key, String(value));
}

/**
 * Laravel `decimal` casts reject empty strings. Multipart cannot send JSON null,
 * so a cleared amount is sent as `0` when `allowEmpty` is set.
 */
export function appendOptionalDecimal(
  formData: FormData,
  key: string,
  value: string | number | null | undefined,
  options: AppendStringOptions = {},
): void {
  if (value === undefined) return;
  if (value === null || value === "") {
    if (options.allowEmpty) {
      formData.append(key, "0");
    }
    return;
  }
  formData.append(key, String(value));
}

export function appendFile(
  formData: FormData,
  key: string,
  file: File | undefined | null,
): void {
  if (!file) return;
  formData.append(key, file);
}

/** PHP/Laravel often cannot parse multipart bodies on PUT; spoof via POST + _method. */
export function submitMultipartFormData(
  formData: FormData,
  method: "PUT" | "PATCH",
): { method: "POST"; body: FormData } {
  formData.append("_method", method);
  return { method: "POST", body: formData };
}

export type NumberArrayFormDataStyle = "indexed" | "bracket";

type AppendNumberArrayOptions = {
  /** When true, empty arrays are sent as the JSON string "[]" so PHP/Laravel can detect a clear. */
  allowEmpty?: boolean;
};

/** Appends numeric arrays for PHP/Laravel form-data parsing. */
export function appendNumberArray(
  formData: FormData,
  key: string,
  values: number[] | undefined,
  style: NumberArrayFormDataStyle = "indexed",
  options: AppendNumberArrayOptions = {},
): void {
  if (values === undefined) return;

  if (!values.length) {
    if (options.allowEmpty) {
      formData.append(key, "[]");
    }
    return;
  }

  if (style === "bracket") {
    values.forEach((value) => {
      formData.append(`${key}[]`, String(value));
    });
    return;
  }

  values.forEach((value, index) => {
    formData.append(`${key}[${index}]`, String(value));
  });
}
