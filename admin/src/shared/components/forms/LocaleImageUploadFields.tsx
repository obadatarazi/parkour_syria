import { CrudFileUpload } from "@/shared/crud";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/design-system/components/ui/tabs";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import type { LocaleCode } from "@/shared/lib/api/form-data.utils";
import { resolveMediaUrl } from "@/shared/lib/resolve-media-url";

export type LocaleImageValue = {
  file?: File | null;
  previewUrl?: string | null;
  deleteImage?: boolean;
};

export type LocaleImageUploadValue = Partial<Record<LocaleCode, LocaleImageValue>>;

type LocaleImageUploadFieldsProps = {
  value: LocaleImageUploadValue;
  onChange: (value: LocaleImageUploadValue) => void;
  accept?: string;
  errors?: Partial<Record<LocaleCode, string>>;
  /** "tabs" switches the stacked EN/AR uploads into a tabbed view to cut down scroll height. */
  layout?: "stacked" | "tabs";
};

export function LocaleImageUploadFields({
  value,
  onChange,
  accept = "image/*",
  errors,
  layout = "stacked",
}: LocaleImageUploadFieldsProps) {
  const t = useTranslation();

  const updateLocale = (locale: LocaleCode, next: LocaleImageValue) => {
    onChange({
      ...value,
      [locale]: {
        ...value[locale],
        ...next,
      },
    });
  };

  const englishField = (
    <div className="space-y-2">
      <CrudFileUpload
        label={t.imageEnglish}
        accept={accept}
        error={errors?.en}
        value={value.en?.file ?? null}
        onFileSelect={(file) =>
          updateLocale("en", { file, deleteImage: false, previewUrl: file ? undefined : value.en?.previewUrl })
        }
      />
      {value.en?.previewUrl && !value.en?.file ? (
        <img
          src={resolveMediaUrl(value.en.previewUrl) ?? undefined}
          alt=""
          className="h-24 w-auto rounded-lg border border-border object-cover"
        />
      ) : null}
    </div>
  );

  const arabicField = (
    <div className="space-y-2">
      <CrudFileUpload
        label={t.imageArabic}
        accept={accept}
        error={errors?.ar}
        value={value.ar?.file ?? null}
        onFileSelect={(file) =>
          updateLocale("ar", { file, deleteImage: false, previewUrl: file ? undefined : value.ar?.previewUrl })
        }
      />
      {value.ar?.previewUrl && !value.ar?.file ? (
        <img
          src={resolveMediaUrl(value.ar.previewUrl) ?? undefined}
          alt=""
          className="h-24 w-auto rounded-lg border border-border object-cover"
        />
      ) : null}
    </div>
  );

  if (layout === "tabs") {
    return (
      <Tabs defaultValue="en">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="en" className="gap-1.5">
            {t.tabEnglish}
            {errors?.en ? (
              <span className="size-1.5 shrink-0 rounded-full bg-destructive" aria-hidden="true" />
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="ar" className="gap-1.5">
            {t.tabArabic}
            {errors?.ar ? (
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
