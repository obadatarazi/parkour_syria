import { useEffect, useMemo, useState } from "react";

import { ProductSeoSnippetFields } from "@/features/products/components/ProductSeoSnippetFields";
import { MediaImage } from "@/shared/components";
import { CrudFileUpload } from "@/shared/crud";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/design-system/components/ui/tabs";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import type { ProductTranslationsInput } from "@/shared/lib/api/form-data.utils";

type ProductSeoFieldsProps = {
  value: ProductTranslationsInput;
  onChange: (value: ProductTranslationsInput) => void;
  metaFeatureImage: File | null;
  metaFeatureImageUrl?: string | null;
  onMetaFeatureImageChange: (file: File | null) => void;
};

export function ProductSeoFields({
  value,
  onChange,
  metaFeatureImage,
  metaFeatureImageUrl,
  onMetaFeatureImageChange,
}: ProductSeoFieldsProps) {
  const t = useTranslation();
  const [activeLocale, setActiveLocale] = useState<"en" | "ar">("en");
  const [selectedImagePreviewUrl, setSelectedImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!metaFeatureImage) {
      setSelectedImagePreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(metaFeatureImage);
    setSelectedImagePreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [metaFeatureImage]);

  const previewImageUrl = useMemo(
    () => selectedImagePreviewUrl || metaFeatureImageUrl || null,
    [selectedImagePreviewUrl, metaFeatureImageUrl],
  );

  const updateLocale = (
    locale: "en" | "ar",
    field: "metaTitle" | "metaDescription",
    next: string,
  ) => {
    onChange({
      ...value,
      [locale]: {
        title: value[locale]?.title ?? "",
        slug: value[locale]?.slug,
        description: value[locale]?.description ?? "",
        metaTitle: value[locale]?.metaTitle ?? "",
        metaDescription: value[locale]?.metaDescription ?? "",
        benefits: value[locale]?.benefits ?? "",
        ingredients: value[locale]?.ingredients ?? "",
        usageMethod: value[locale]?.usageMethod ?? "",
        warnings: value[locale]?.warnings ?? "",
        countryOfOrigin: value[locale]?.countryOfOrigin ?? "",
        [field]: next,
      },
    });
  };

  const renderLocaleSeo = (locale: "en" | "ar") => (
    <ProductSeoSnippetFields
      locale={locale}
      title={value[locale]?.title ?? ""}
      description={value[locale]?.description ?? ""}
      slug={value[locale]?.slug}
      metaTitle={value[locale]?.metaTitle ?? ""}
      metaDescription={value[locale]?.metaDescription ?? ""}
      previewImageUrl={previewImageUrl}
      onMetaTitleChange={(next) => updateLocale(locale, "metaTitle", next)}
      onMetaDescriptionChange={(next) => updateLocale(locale, "metaDescription", next)}
      alwaysEditing
    />
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeLocale} onValueChange={(next) => setActiveLocale(next as "en" | "ar")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="en">{t.tabEnglish}</TabsTrigger>
          <TabsTrigger value="ar">{t.tabArabic}</TabsTrigger>
        </TabsList>
        <TabsContent value="en" className="mt-4">
          {renderLocaleSeo("en")}
        </TabsContent>
        <TabsContent value="ar" className="mt-4">
          {renderLocaleSeo("ar")}
        </TabsContent>
      </Tabs>

      <div className="space-y-3 rounded-xl border border-border bg-muted/10 p-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{t.metaFeatureImage}</p>
          <p className="text-xs text-muted-foreground">{t.metaFeatureImageHint}</p>
        </div>

        {metaFeatureImageUrl && !metaFeatureImage ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">{t.metaFeatureImageCurrent}</p>
            <div className="overflow-hidden rounded-lg border border-border">
              <MediaImage
                src={metaFeatureImageUrl}
                alt=""
                className="max-h-40 w-full object-cover"
              />
            </div>
          </div>
        ) : null}

        <CrudFileUpload
          label={t.metaFeatureImage}
          accept="image/*"
          value={metaFeatureImage}
          onFileSelect={onMetaFeatureImageChange}
        />
      </div>
    </div>
  );
}
