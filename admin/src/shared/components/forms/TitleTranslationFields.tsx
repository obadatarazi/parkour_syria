import { useEffect, useState } from "react";

import { TextField } from "@/shared/components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/design-system/components/ui/tabs";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import type { TranslationsInput } from "@/shared/lib/api/form-data.utils";

type TitleTranslationFieldsProps = {
  value: TranslationsInput;
  onChange: (value: TranslationsInput) => void;
  titleErrors?: Partial<Record<"en" | "ar", string>>;
  /** "tabs" switches the 2 stacked fields into an EN/AR tabbed view to cut down scroll height. */
  layout?: "stacked" | "tabs";
  /** Focuses the English title input as soon as the fields mount. */
  autoFocusFirstField?: boolean;
  titleLabelEn?: string;
  titleLabelAr?: string;
  placeholderEn?: string;
  placeholderAr?: string;
};

export function TitleTranslationFields({
  value,
  onChange,
  titleErrors,
  layout = "stacked",
  autoFocusFirstField = false,
  titleLabelEn,
  titleLabelAr,
  placeholderEn,
  placeholderAr,
}: TitleTranslationFieldsProps) {
  const t = useTranslation();
  const [activeLocale, setActiveLocale] = useState<"en" | "ar">("en");

  useEffect(() => {
    if (titleErrors?.en) setActiveLocale("en");
    else if (titleErrors?.ar) setActiveLocale("ar");
  }, [titleErrors]);

  const updateLocale = (locale: "en" | "ar", next: string) => {
    onChange({
      ...value,
      [locale]: {
        title: next,
        description: value[locale]?.description ?? "",
      },
    });
  };

  const englishField = (
    <TextField
      label={titleLabelEn ?? t.titleEnglish}
      value={value.en?.title ?? ""}
      onChange={(event) => updateLocale("en", event.target.value)}
      error={titleErrors?.en}
      placeholder={placeholderEn}
      autoFocus={autoFocusFirstField}
      required
    />
  );

  const arabicField = (
    <TextField
      label={titleLabelAr ?? t.titleArabic}
      value={value.ar?.title ?? ""}
      onChange={(event) => updateLocale("ar", event.target.value)}
      error={titleErrors?.ar}
      placeholder={placeholderAr}
      dir="rtl"
    />
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
          {englishField}
        </TabsContent>
        <TabsContent value="ar" className="space-y-4 pt-4">
          {arabicField}
        </TabsContent>
      </Tabs>
    );
  }

  return (
    <div className="space-y-4">
      {englishField}
      {arabicField}
    </div>
  );
}
