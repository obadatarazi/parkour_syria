import { useEffect, useState } from "react";

import { TextAreaField } from "@/shared/components/forms/TextAreaField";
import { TextField } from "@/shared/components/forms/TextField";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/design-system/components/ui/tabs";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import type { LocaleCode } from "@/shared/lib/api/form-data.utils";
import { LOCALE_ORDER, type LocaleFieldValues } from "@/shared/lib/api/locale-fields.utils";

import type { LocaleFieldErrors } from "./locale-fields.validation";

export type LocaleFieldDefinition<TField extends string = string> = {
  key: TField;
  label: string;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  /** Required in Arabic. English rows are optional, but once started they need this field too. */
  required?: boolean;
  helperText?: string;
};

type LocaleFieldsTabsProps<TField extends string> = {
  fields: LocaleFieldDefinition<TField>[];
  value: LocaleFieldValues<TField>;
  onChange: (value: LocaleFieldValues<TField>) => void;
  errors?: LocaleFieldErrors<TField>;
  autoFocusFirstField?: boolean;
};

/** Arabic / English tabs over any set of translated fields, Arabic first. */
export function LocaleFieldsTabs<TField extends string>({
  fields,
  value,
  onChange,
  errors,
  autoFocusFirstField = false,
}: LocaleFieldsTabsProps<TField>) {
  const t = useTranslation();
  const [activeLocale, setActiveLocale] = useState<LocaleCode>("ar");

  useEffect(() => {
    const failing = LOCALE_ORDER.find((locale) => Object.values(errors?.[locale] ?? {}).some(Boolean));
    if (failing) setActiveLocale(failing);
  }, [errors]);

  const updateField = (locale: LocaleCode, field: TField, next: string) => {
    onChange({ ...value, [locale]: { ...value[locale], [field]: next } });
  };

  const tabLabel: Record<LocaleCode, string> = { ar: t.tabArabic, en: t.tabEnglish };

  return (
    <Tabs value={activeLocale} onValueChange={(next) => setActiveLocale(next as LocaleCode)}>
      <TabsList className="grid w-full grid-cols-2">
        {LOCALE_ORDER.map((locale) => (
          <TabsTrigger key={locale} value={locale} className="gap-1.5">
            {tabLabel[locale]}
            {Object.values(errors?.[locale] ?? {}).some(Boolean) ? (
              <span className="size-1.5 shrink-0 rounded-full bg-destructive" aria-hidden="true" />
            ) : null}
          </TabsTrigger>
        ))}
      </TabsList>
      {LOCALE_ORDER.map((locale) => (
        <TabsContent key={locale} value={locale} className="space-y-4 pt-4">
          {fields.map((field, index) => {
            const common = {
              label: field.label,
              value: value[locale]?.[field.key] ?? "",
              error: errors?.[locale]?.[field.key],
              helperText: field.helperText,
              maxLength: field.maxLength,
              required: field.required && locale === "ar",
              dir: locale === "ar" ? ("rtl" as const) : ("ltr" as const),
            };
            return field.multiline ? (
              <TextAreaField
                key={field.key}
                {...common}
                rows={field.rows ?? 4}
                onChange={(event) => updateField(locale, field.key, event.target.value)}
              />
            ) : (
              <TextField
                key={field.key}
                {...common}
                autoFocus={autoFocusFirstField && index === 0 && locale === "ar"}
                onChange={(event) => updateField(locale, field.key, event.target.value)}
              />
            );
          })}
        </TabsContent>
      ))}
    </Tabs>
  );
}
