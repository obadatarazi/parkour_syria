import { useEffect, useState } from "react";

import { TextAreaField, TextField } from "@/shared/components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/design-system/components/ui/tabs";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import type { TranslationsInput } from "@/shared/lib/api/form-data.utils";
import { slugifyArabicTitle, slugifyEnglishTitle } from "@/shared/lib/slug.utils";

type TranslationFieldsProps = {
  value: TranslationsInput;
  onChange: (value: TranslationsInput) => void;
  titleErrors?: Partial<Record<"en" | "ar", string>>;
  /** Shows a live preview of the slug the backend will generate from each title. */
  showSlugPreview?: boolean;
  /** "tabs" switches the 4 stacked fields into an EN/AR tabbed view to cut down scroll height. */
  layout?: "stacked" | "tabs";
  /** Focuses the English title input as soon as the fields mount. */
  autoFocusFirstField?: boolean;
};

export function TranslationFields({
  value,
  onChange,
  titleErrors,
  showSlugPreview = false,
  layout = "stacked",
  autoFocusFirstField = false,
}: TranslationFieldsProps) {
  const t = useTranslation();
  const [activeLocale, setActiveLocale] = useState<"en" | "ar">("en");

  useEffect(() => {
    if (titleErrors?.en) setActiveLocale("en");
    else if (titleErrors?.ar) setActiveLocale("ar");
  }, [titleErrors]);

  const enTitle = value.en?.title?.trim() ?? "";
  const arTitle = value.ar?.title?.trim() ?? "";
  const enSlugPreview =
    showSlugPreview && enTitle ? `${t.slugPreviewLabel}: ${slugifyEnglishTitle(enTitle)}` : undefined;
  const arSlugPreview =
    showSlugPreview && arTitle ? `${t.slugPreviewLabel}: ${slugifyArabicTitle(arTitle)}` : undefined;

  const updateLocale = (locale: "en" | "ar", field: "title" | "description", next: string) => {
    onChange({
      ...value,
      [locale]: {
        title: value[locale]?.title ?? "",
        description: value[locale]?.description ?? "",
        [field]: next,
      },
    });
  };

  const englishFields = (
    <>
      <TextField
        label={t.titleEnglish}
        value={value.en?.title ?? ""}
        onChange={(event) => updateLocale("en", "title", event.target.value)}
        error={titleErrors?.en}
        helperText={enSlugPreview}
        autoFocus={autoFocusFirstField}
        required
      />
      <TextAreaField
        label={t.descriptionEnglish}
        value={value.en?.description ?? ""}
        onChange={(event) => updateLocale("en", "description", event.target.value)}
        rows={3}
      />
    </>
  );

  const arabicFields = (
    <>
      <TextField
        label={t.titleArabic}
        value={value.ar?.title ?? ""}
        onChange={(event) => updateLocale("ar", "title", event.target.value)}
        error={titleErrors?.ar}
        helperText={arSlugPreview}
        dir="rtl"
      />
      <TextAreaField
        label={t.descriptionArabic}
        value={value.ar?.description ?? ""}
        onChange={(event) => updateLocale("ar", "description", event.target.value)}
        rows={3}
        dir="rtl"
      />
    </>
  );

  if (layout === "tabs") {
    return (
      <Tabs value={activeLocale} onValueChange={(next) => setActiveLocale(next as "en" | "ar")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="en" className="gap-1.5">
            {t.tabEnglish}
            {titleErrors?.en ? (
              <span className="size-1.5 shrink-0 rounded-full bg-destructive" aria-hidden="true" />
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="ar" className="gap-1.5">
            {t.tabArabic}
            {titleErrors?.ar ? (
              <span className="size-1.5 shrink-0 rounded-full bg-destructive" aria-hidden="true" />
            ) : null}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="en" className="space-y-4 pt-4">
          {englishFields}
        </TabsContent>
        <TabsContent value="ar" className="space-y-4 pt-4">
          {arabicFields}
        </TabsContent>
      </Tabs>
    );
  }

  return (
    <div className="space-y-4">
      {englishFields}
      {arabicFields}
    </div>
  );
}
