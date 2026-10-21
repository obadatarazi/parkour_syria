import type { LocaleCode } from "@/shared/lib/api/form-data.utils";
import { LOCALE_ORDER, type LocaleFieldValues } from "@/shared/lib/api/locale-fields.utils";

export type LocaleFieldErrors<TField extends string = string> = Partial<
  Record<LocaleCode, Partial<Record<TField, string>>>
>;

type RequiredFieldDefinition<TField extends string> = { key: TField; required?: boolean };

/**
 * Arabic must carry every required field. An English row that has anything typed in it must carry
 * them too, otherwise it is dropped from the payload and silently lost.
 */
export function validateLocaleFields<TField extends string>(
  value: LocaleFieldValues<TField>,
  fields: RequiredFieldDefinition<TField>[],
  requiredMessage: string,
): LocaleFieldErrors<TField> {
  const errors: LocaleFieldErrors<TField> = {};

  for (const locale of LOCALE_ORDER) {
    const row: Partial<Record<TField, string>> = value[locale] ?? {};
    const started = Object.values(row).some((text) => typeof text === "string" && text.trim());
    if (locale === "en" && !started) continue;

    for (const field of fields) {
      if (field.required && !(row[field.key] ?? "").trim()) {
        errors[locale] = { ...errors[locale], [field.key]: requiredMessage };
      }
    }
  }

  return errors;
}

export function hasLocaleFieldErrors(errors: LocaleFieldErrors): boolean {
  return Object.values(errors).some((row) => Object.values(row ?? {}).some(Boolean));
}
