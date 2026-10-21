import { useEffect, useState } from "react";

import type { NotificationTranslations } from "@/features/notifications/types/notifications.types";
import { TextAreaField, TextField } from "@/shared/components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/design-system/components/ui/tabs";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type NotificationTranslationFieldsProps = {
  value: NotificationTranslations;
  onChange: (value: NotificationTranslations) => void;
  titleErrors?: Partial<Record<"en" | "ar", string>>;
  autoFocusFirstField?: boolean;
};

export function NotificationTranslationFields({
  value,
  onChange,
  titleErrors,
  autoFocusFirstField = false,
}: NotificationTranslationFieldsProps) {
  const t = useTranslation();
  const [activeLocale, setActiveLocale] = useState<"en" | "ar">("en");

  useEffect(() => {
    if (titleErrors?.en) setActiveLocale("en");
    else if (titleErrors?.ar) setActiveLocale("ar");
  }, [titleErrors]);

  const updateLocale = (locale: "en" | "ar", field: "title" | "body", next: string) => {
    onChange({
      ...value,
      [locale]: {
        title: value[locale]?.title ?? "",
        body: value[locale]?.body ?? "",
        [field]: next,
      },
    });
  };

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
        <TextField
          label={t.titleEnglish}
          value={value.en?.title ?? ""}
          onChange={(event) => updateLocale("en", "title", event.target.value)}
          error={titleErrors?.en}
          autoFocus={autoFocusFirstField}
          required
        />
        <TextAreaField
          label={t.notificationBodyEnglish}
          value={value.en?.body ?? ""}
          onChange={(event) => updateLocale("en", "body", event.target.value)}
          rows={4}
        />
      </TabsContent>
      <TabsContent value="ar" className="space-y-4 pt-4">
        <TextField
          label={t.titleArabic}
          value={value.ar?.title ?? ""}
          onChange={(event) => updateLocale("ar", "title", event.target.value)}
          error={titleErrors?.ar}
          dir="rtl"
          required
        />
        <TextAreaField
          label={t.notificationBodyArabic}
          value={value.ar?.body ?? ""}
          onChange={(event) => updateLocale("ar", "body", event.target.value)}
          rows={4}
          dir="rtl"
        />
      </TabsContent>
    </Tabs>
  );
}
