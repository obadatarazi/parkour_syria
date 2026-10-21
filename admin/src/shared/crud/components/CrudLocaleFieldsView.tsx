import { CrudDetailField } from "@/shared/crud/components/CrudDetailField";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import type { LocaleCode } from "@/shared/lib/api/form-data.utils";
import { LOCALE_ORDER } from "@/shared/lib/api/locale-fields.utils";

type CrudLocaleFieldsViewProps = {
  translations: unknown;
  fields: { key: string; label: string; multiline?: boolean }[];
};

/** Read-only Arabic / English values of a record's translated fields, for a view dialog. */
export function CrudLocaleFieldsView({ translations, fields }: CrudLocaleFieldsViewProps) {
  const t = useTranslation();
  const source = (translations && typeof translations === "object" ? translations : {}) as Record<
    string,
    Record<string, unknown> | undefined
  >;
  const localeLabel: Record<LocaleCode, string> = { ar: t.tabArabic, en: t.tabEnglish };

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.key} className="grid gap-4 sm:grid-cols-2">
          {LOCALE_ORDER.map((locale) => {
            const value = source[locale]?.[field.key];
            const text = typeof value === "string" ? value.trim() : "";
            return (
              <CrudDetailField key={locale} label={`${field.label} · ${localeLabel[locale]}`}>
                {text ? (
                  <span
                    dir={locale === "ar" ? "rtl" : "ltr"}
                    className={field.multiline ? "block whitespace-pre-line" : "block"}
                  >
                    {text}
                  </span>
                ) : (
                  <span className="text-muted-foreground">{t.notSet}</span>
                )}
              </CrudDetailField>
            );
          })}
        </div>
      ))}
    </div>
  );
}
